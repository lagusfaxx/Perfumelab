'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { RITUAL_STEPS, RITUAL_TOTAL_STEPS } from '@/lib/ritual-config';
import { acumular, normalizar } from '@/lib/mapping';
import { FAMILIAS } from '@/lib/families';
import type { FamiliaKey } from '@/types';
import { Aura } from '@/components/sensory/Aura';
import { ParticleField } from '@/components/sensory/ParticleField';
import { SoundToggle } from '@/components/sensory/SoundToggle';
import { useSound } from '@/components/sensory/SoundProvider';
import { OptionCard } from './OptionCard';

type Phase = 'q' | 'bloom' | 'reflejo' | 'loading' | 'error';
const EASE = [0.16, 1, 0.3, 1] as const;
const BLOOM_MS = 1800;
const REFLEJO_MS = 2000;

export function RitualExperience() {
  const router = useRouter();
  const { setScene, enabled } = useSound();

  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeFamilia, setActiveFamilia] = useState<FamiliaKey>('VERDES');
  const [previewFamilia, setPreviewFamilia] = useState<FamiliaKey | null>(null);
  const [bloom, setBloom] = useState<{ familia: FamiliaKey; aroma: string; label: string } | null>(null);
  const [reflejo, setReflejo] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('q');

  const step = RITUAL_STEPS[stepIdx];
  // La familia que tiñe la escena: preview al pasar > bloom > activa.
  const escena = previewFamilia ?? activeFamilia;

  // El soundscape sólo cambia al confirmar (no en hover, para no entrecortar el audio).
  useEffect(() => {
    if (enabled) setScene(activeFamilia);
  }, [activeFamilia, enabled, setScene]);

  const advance = (isLast: boolean, ans: Record<string, string>) => {
    if (isLast) return finish(ans);
    setPhase('q');
    setStepIdx((i) => i + 1);
  };

  const finish = async (ans: Record<string, string>) => {
    setPhase('loading');
    try {
      const res = await fetch('/api/perfil', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respuestas: ans }),
      });
      if (!res.ok) throw new Error('fail');
      const data = (await res.json()) as { id: string };
      router.push(`/revelacion/${data.id}`);
    } catch {
      setPhase('error');
    }
  };

  const select = (optionId: string) => {
    if (phase !== 'q') return;
    const opt = step.options.find((o) => o.id === optionId);
    if (!opt) return;

    const next = { ...answers, [step.id]: optionId };
    setAnswers(next);
    setPreviewFamilia(null);
    const familia = opt.familiaAcento ?? activeFamilia;
    setActiveFamilia(familia);

    const acc = normalizar(acumular(next));
    const texto = step.reflejo?.(acc) ?? null;
    const isLast = stepIdx === RITUAL_TOTAL_STEPS - 1;

    // 1) Florece el aroma elegido.
    setBloom({ familia, aroma: opt.aroma ?? opt.hint ?? opt.label, label: opt.label });
    setPhase('bloom');

    window.setTimeout(() => {
      setBloom(null);
      // 2) Reflejo (si hay), luego avanza.
      if (texto) {
        setReflejo(texto);
        setPhase('reflejo');
        window.setTimeout(() => {
          setReflejo(null);
          advance(isLast, next);
        }, REFLEJO_MS);
      } else {
        advance(isLast, next);
      }
    }, BLOOM_MS);
  };

  const back = () => {
    if (phase !== 'q' || stepIdx === 0) return;
    setStepIdx((i) => i - 1);
  };

  const progress = ((stepIdx + (phase === 'q' ? 0 : 1)) / RITUAL_TOTAL_STEPS) * 100;
  const auraIntensity = phase === 'bloom' ? 0.5 : 0.28;

  return (
    <Aura
      familia={escena}
      intensity={auraIntensity}
      className="relative flex min-h-[100dvh] flex-col overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <ParticleField familia={escena} intensity={phase === 'bloom' ? 1.25 : 0.85} />
      </div>

      {/* Header: progreso + sonido */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-6 sm:px-8">
        <div className="flex items-center gap-3">
          {stepIdx > 0 && phase === 'q' && (
            <button
              onClick={back}
              className="text-xs text-ink-muted transition-colors hover:text-ink"
              aria-label="Pregunta anterior"
            >
              ← atrás
            </button>
          )}
          <span className="text-xs tracking-[0.25em] text-ink-muted">
            {String(stepIdx + 1).padStart(2, '0')} / {String(RITUAL_TOTAL_STEPS).padStart(2, '0')}
          </span>
        </div>
        <SoundToggle />
      </header>

      <div className="relative z-10 mx-5 mt-4 h-px bg-ink/10 sm:mx-8">
        <motion.div
          className="absolute inset-y-0 left-0 bg-brass"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <AnimatePresence mode="wait">
          {phase === 'loading' ? (
            <Mezclando key="loading" />
          ) : phase === 'error' ? (
            <ErrorBlock key="error" onRetry={() => finish(answers)} />
          ) : phase === 'bloom' && bloom ? (
            <motion.div
              key={`bloom-${stepIdx}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="flex flex-col items-center text-center"
            >
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.7 }}
                className="text-xs uppercase tracking-[0.3em] text-ink-muted"
              >
                {bloom.label}
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.25, duration: 1.1, ease: EASE }}
                className="mt-5 max-w-xl font-serif text-3xl leading-snug sm:text-4xl"
                style={{ color: FAMILIAS[bloom.familia].colorSoft }}
              >
                {bloom.aroma}
              </motion.p>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-7 text-xs italic text-ink-muted"
              >
                respira…
              </motion.span>
            </motion.div>
          ) : reflejo ? (
            <motion.p
              key={`reflejo-${stepIdx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: EASE }}
              className="max-w-xl text-center font-serif text-2xl leading-relaxed text-brass-soft sm:text-3xl"
            >
              {reflejo}
            </motion.p>
          ) : (
            <motion.div
              key={`step-${stepIdx}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="w-full max-w-xl"
            >
              <h1 className="text-balance text-center text-3xl leading-tight text-ink sm:text-4xl">
                {step.pregunta}
              </h1>
              {step.subtitulo && (
                <p className="mt-3 text-center text-sm italic text-ink-muted">{step.subtitulo}</p>
              )}
              <div className="mt-9 flex flex-col gap-3">
                {step.options.map((opt, i) => (
                  <OptionCard
                    key={opt.id}
                    option={opt}
                    index={i}
                    selected={answers[step.id] === opt.id}
                    onSelect={() => select(opt.id)}
                    onPreview={setPreviewFamilia}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </Aura>
  );
}

function Mezclando() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <motion.div
        className="h-16 w-16 rounded-full border border-brass/40"
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ rotate: { duration: 3, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
      />
      <p className="font-serif text-2xl text-ink">Mezclando tu fragancia…</p>
      <p className="text-sm text-ink-muted">Traduciendo tus respuestas en aroma.</p>
    </motion.div>
  );
}

function ErrorBlock({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-5 text-center"
    >
      <p className="font-serif text-2xl text-ink">Algo se interpuso en el aire.</p>
      <p className="max-w-sm text-sm text-ink-muted">
        No pudimos revelar tu fragancia. Respira e inténtalo otra vez.
      </p>
      <button
        onClick={onRetry}
        className="rounded-full bg-brass px-6 py-3 text-sm font-medium text-canvas transition-colors hover:bg-brass-soft"
      >
        Reintentar
      </button>
    </motion.div>
  );
}
