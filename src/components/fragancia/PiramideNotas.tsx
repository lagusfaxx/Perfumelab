'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FAMILIAS } from '@/lib/families';
import { sentirNota } from '@/lib/notas';
import type { FamiliaKey } from '@/types';
import { cn } from '@/lib/utils';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Notas {
  cabeza: string[];
  corazon: string[];
  fondo: string[];
}

const TIERS = [
  { key: 'cabeza', label: 'Lo primero', glyph: '☀', sub: 'lo que sientes al abrir' },
  { key: 'corazon', label: 'El corazón', glyph: '❀', sub: 'lo que queda en tu piel' },
  { key: 'fondo', label: 'El recuerdo', glyph: '◍', sub: 'lo que persiste al final' },
] as const;

function palabraIntensidad(v: number) {
  return v < 0.4 ? 'sutil, de piel' : v < 0.72 ? 'presente, te acompaña' : 'intensa, deja huella';
}
function palabraEstela(v: number) {
  return v < 0.45 ? 'cercana' : v < 0.75 ? 'media' : 'envolvente';
}

/**
 * Resumen interactivo del aroma: la pirámide olfativa "viva".
 * Tocas (o pasas) por cada nota y se enciende con su color + un descriptor sensorial.
 */
export function PiramideNotas({
  familia,
  notas,
  intensidad,
  estela,
}: {
  familia: FamiliaKey;
  notas: Notas;
  intensidad: number;
  estela: number;
}) {
  const f = FAMILIAS[familia];
  const tierColor: Record<string, string> = {
    cabeza: f.colorSoft,
    corazon: f.color,
    fondo: f.colorDeep,
  };

  const [activa, setActiva] = useState<{ nota: string; tier: string } | null>(null);
  const desc = activa ? sentirNota(activa.nota) : '';

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        {TIERS.map((t) => {
          const lista = notas[t.key] as string[];
          if (!lista?.length) return null;
          const color = tierColor[t.key];
          return (
            <div key={t.key} className="rounded-2xl border border-ink/10 bg-canvas-soft/40 p-3.5">
              <div className="mb-2.5 flex items-baseline gap-2">
                <span className="text-sm" style={{ color }}>
                  {t.glyph}
                </span>
                <span className="font-serif text-base text-ink">{t.label}</span>
                <span className="text-xs text-ink-muted">· {t.sub}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {lista.map((nota) => {
                  const sel = activa?.nota === nota;
                  return (
                    <button
                      key={nota}
                      type="button"
                      onClick={() => setActiva({ nota, tier: t.key })}
                      onMouseEnter={() => setActiva({ nota, tier: t.key })}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm transition-all duration-300',
                        sel ? 'text-canvas' : 'border-ink/15 text-ink-soft hover:border-ink/30'
                      )}
                      style={
                        sel
                          ? { background: color, borderColor: color, boxShadow: `0 0 24px -6px ${color}` }
                          : undefined
                      }
                    >
                      {nota}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lo que sientes — descriptor de la nota activa */}
      <div className="mt-3 flex min-h-[3.25rem] items-center justify-center rounded-2xl border border-dashed border-ink/12 px-4 text-center">
        <AnimatePresence mode="wait">
          {activa ? (
            <motion.p
              key={activa.nota}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="text-sm text-ink-soft"
            >
              <span className="font-medium" style={{ color: tierColor[activa.tier] }}>
                {activa.nota}
              </span>
              {desc && <span className="text-ink-muted"> — {desc}</span>}
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-ink-muted"
            >
              Toca cada nota para sentirla ✷
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Medidores */}
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Medidor titulo="Intensidad" valor={intensidad} glosa={palabraIntensidad(intensidad)} color={f.color} />
        <Medidor titulo="Estela" valor={estela} glosa={palabraEstela(estela)} color={f.colorSoft} />
      </div>
    </div>
  );
}

function Medidor({
  titulo,
  valor,
  glosa,
  color,
}: {
  titulo: string;
  valor: number;
  glosa: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs uppercase tracking-wider text-ink-muted">{titulo}</span>
        <span className="text-xs text-ink-soft">{glosa}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.round(Math.max(0.06, Math.min(1, valor)) * 100)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: EASE }}
        />
      </div>
    </div>
  );
}
