'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FAMILIAS } from '@/lib/families';
import type { FamiliaKey } from '@/types';

/**
 * Motor de soundscape ambiental con Web Audio API.
 * - Sonido SINTETIZADO (osciladores) → cero assets pesados, lazy por diseño.
 * - NUNCA autoplay: requiere gesto del usuario (toggle).
 * - Cada familia tiene su timbre; los pasos del ritual cambian la escena con crossfade.
 */

interface SoundState {
  enabled: boolean;
  toggle: () => void;
  setScene: (familia: FamiliaKey | null) => void;
  scene: FamiliaKey | null;
}

const SoundContext = createContext<SoundState | null>(null);

const MASTER = 0.11; // volumen ambiental, deliberadamente sutil

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [scene, setSceneState] = useState<FamiliaKey | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const voicesRef = useRef<{ osc: OscillatorNode; gain: GainNode; lfo?: OscillatorNode }[]>([]);

  const teardownVoices = useCallback((fade = 0.8) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    for (const v of voicesRef.current) {
      try {
        v.gain.gain.cancelScheduledValues(now);
        v.gain.gain.setValueAtTime(v.gain.gain.value, now);
        v.gain.gain.linearRampToValueAtTime(0, now + fade);
        v.osc.stop(now + fade + 0.05);
        v.lfo?.stop(now + fade + 0.05);
      } catch {
        /* noop */
      }
    }
    voicesRef.current = [];
  }, []);

  const buildScene = useCallback((familia: FamiliaKey) => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const cfg = FAMILIAS[familia].sonido;
    const now = ctx.currentTime;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cfg.textura === 'agudo' ? 2600 : cfg.textura === 'calido' ? 700 : 1400;
    filter.Q.value = 0.7;
    filter.connect(master);

    // LFO que "respira" sobre el cutoff del filtro → movimiento lento
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = filter.frequency.value * 0.35;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();

    cfg.armonicos.forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = cfg.onda;
      osc.frequency.value = cfg.base * mult;
      // leve desafinación para que respire
      osc.detune.value = (i % 2 === 0 ? 1 : -1) * (3 + i * 2);

      const g = ctx.createGain();
      const target = (i === 0 ? 0.5 : 0.28 / i) ;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(target, now + 1.4);

      osc.connect(g).connect(filter);
      osc.start();
      voicesRef.current.push({ osc, gain: g, lfo: i === 0 ? lfo : undefined });
    });
  }, []);

  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const AC = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new AC();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    ctxRef.current = ctx;
    masterRef.current = master;
    return ctx;
  }, []);

  const toggle = useCallback(() => {
    if (!enabled) {
      const ctx = ensureContext();
      ctx.resume();
      const master = masterRef.current!;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(MASTER, ctx.currentTime + 1.0);
      if (voicesRef.current.length === 0) buildScene(scene ?? 'ORIENTALES');
      setEnabled(true);
    } else {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (ctx && master) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      }
      setEnabled(false);
    }
  }, [enabled, ensureContext, buildScene, scene]);

  const setScene = useCallback(
    (familia: FamiliaKey | null) => {
      setSceneState(familia);
      if (!enabled || !familia) return;
      teardownVoices(0.9);
      // pequeño desfase para el crossfade
      setTimeout(() => buildScene(familia), 60);
    },
    [enabled, buildScene, teardownVoices]
  );

  useEffect(() => {
    return () => {
      teardownVoices(0.05);
      ctxRef.current?.close().catch(() => {});
    };
  }, [teardownVoices]);

  return (
    <SoundContext.Provider value={{ enabled, toggle, setScene, scene }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound(): SoundState {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    // Fallback inerte si se usa fuera del provider (evita crashes en tests).
    return { enabled: false, toggle: () => {}, setScene: () => {}, scene: null };
  }
  return ctx;
}
