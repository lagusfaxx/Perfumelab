'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FAMILIAS } from '@/lib/families';
import { sugerencias } from '@/lib/naming';
import { formatCLP } from '@/lib/utils';
import type { FamiliaKey, PreferenceVector } from '@/types';
import { Aura } from '@/components/sensory/Aura';
import { ParticleField } from '@/components/sensory/ParticleField';
import { SoundToggle } from '@/components/sensory/SoundToggle';
import { useSound } from '@/components/sensory/SoundProvider';

const EASE = [0.16, 1, 0.3, 1] as const;

export function Revelacion({
  perfilId,
  nombreInicial,
  vector,
  familia,
  baseNombre,
  baseDescripcion,
  intensidadLabel,
  notas,
  desde,
  afinidad,
  alternativas,
}: {
  perfilId: string;
  nombreInicial: string;
  vector: PreferenceVector;
  familia: FamiliaKey;
  baseNombre: string;
  baseDescripcion: string;
  intensidadLabel: string;
  notas: { cabeza: string[]; corazon: string[]; fondo: string[] };
  desde: number;
  afinidad: number;
  alternativas: { nombre: string; score: number }[];
}) {
  const router = useRouter();
  const { setScene, enabled } = useSound();
  const f = FAMILIAS[familia];

  const [nombre, setNombre] = useState(nombreInicial);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const ideas = useMemo(() => sugerencias(vector), [vector]);

  useEffect(() => {
    setScene(familia);
  }, [familia, setScene]);

  const persistir = async () => {
    const limpio = nombre.trim();
    if (!limpio || !dirty) return;
    try {
      await fetch(`/api/perfil/${perfilId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreFragancia: limpio }),
      });
      setDirty(false);
    } catch {
      /* no bloquea la compra */
    }
  };

  const guardar = async () => {
    setSaving(true);
    await persistir();
    setSaving(false);
    setEditing(false);
  };

  const comprar = async () => {
    await persistir();
    router.push(`/checkout?perfil=${perfilId}`);
  };

  return (
    <Aura
      familia={familia}
      intensity={0.32}
      className="relative flex min-h-[100dvh] flex-col items-center overflow-hidden px-5 py-10 sm:px-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-80">
        <ParticleField familia={familia} intensity={1} />
      </div>

      <div className="absolute right-5 top-6 sm:right-8">
        <SoundToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center"
      >
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-xs uppercase tracking-[0.35em] text-ink-muted"
        >
          Tu fragancia es
        </motion.p>

        {/* Nombre — editable */}
        {editing ? (
          <div className="mt-4 w-full max-w-md">
            <input
              autoFocus
              value={nombre}
              maxLength={60}
              onChange={(e) => {
                setNombre(e.target.value);
                setDirty(true);
              }}
              onKeyDown={(e) => e.key === 'Enter' && guardar()}
              className="w-full border-b border-brass/40 bg-transparent text-center font-serif text-4xl text-brass-soft focus:outline-none sm:text-5xl"
              aria-label="Nombre de tu fragancia"
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {ideas.map((idea) => (
                <button
                  key={idea}
                  onClick={() => {
                    setNombre(idea);
                    setDirty(true);
                  }}
                  className="rounded-full border border-ink/15 px-3 py-1 text-xs text-ink-soft transition-colors hover:border-brass/50 hover:text-brass-soft"
                >
                  {idea}
                </button>
              ))}
            </div>
            <button
              onClick={guardar}
              disabled={saving}
              className="mt-5 rounded-full bg-brass px-6 py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-brass-soft disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Hacerla mía'}
            </button>
          </div>
        ) : (
          <motion.h1
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 1.1, ease: EASE }}
            className="text-brass-gradient mt-3 px-2 font-serif text-5xl leading-tight sm:text-6xl"
          >
            {nombre}
          </motion.h1>
        )}

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="mt-3 text-xs text-ink-muted underline-offset-4 transition-colors hover:text-brass-soft hover:underline"
          >
            ✎ Renómbrala — hazla tuya
          </button>
        )}

        {/* Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="glass rounded-full px-3 py-1.5 text-ink-soft" style={{ color: f.color }}>
            {f.nombre}
          </span>
          <span className="glass rounded-full px-3 py-1.5 text-ink-soft">{intensidadLabel}</span>
          <span className="glass rounded-full px-3 py-1.5 text-ink-soft">{afinidad}% de afinidad</span>
        </div>

        <p className="mt-6 max-w-md text-pretty text-base italic leading-relaxed text-ink-soft">
          {baseDescripcion}
        </p>

        {/* Pirámide de notas */}
        <div className="mt-8 grid w-full max-w-lg gap-3 text-left">
          <NotaFila titulo="Cabeza" notas={notas.cabeza} color={f.colorSoft} delay={0.7} />
          <NotaFila titulo="Corazón" notas={notas.corazon} color={f.color} delay={0.85} />
          <NotaFila titulo="Fondo" notas={notas.fondo} color={f.colorDeep} delay={1.0} />
        </div>

        <p className="mt-5 text-xs text-ink-muted">
          Sobre la base <span className="text-ink-soft">{baseNombre}</span>
        </p>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease: EASE }}
          onClick={comprar}
          className="mt-9 rounded-full bg-brass px-9 py-4 text-base font-medium text-canvas shadow-lg shadow-brass/25 transition-all duration-300 hover:bg-brass-soft hover:shadow-brass/40"
        >
          Hazla realidad — desde {formatCLP(desde)}
        </motion.button>

        {/* Alternativas */}
        {alternativas.length > 0 && (
          <div className="mt-10 w-full max-w-md">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-muted">O quizás…</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {alternativas.map((a) => (
                <span
                  key={a.nombre}
                  className="glass rounded-full px-3 py-1.5 text-xs text-ink-soft"
                >
                  {a.nombre} · {a.score}%
                </span>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/ritual"
          className="mt-10 text-xs text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          Rehacer el ritual
        </Link>
      </motion.div>
    </Aura>
  );
}

function NotaFila({
  titulo,
  notas,
  color,
  delay,
}: {
  titulo: string;
  notas: string[];
  color: string;
  delay: number;
}) {
  if (!notas.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.7, ease: EASE }}
      className="glass flex items-center gap-3 rounded-xl px-4 py-3"
    >
      <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: color }} />
      <span className="w-16 flex-shrink-0 text-xs uppercase tracking-wider text-ink-muted">
        {titulo}
      </span>
      <span className="text-sm text-ink-soft">{notas.join(' · ')}</span>
    </motion.div>
  );
}
