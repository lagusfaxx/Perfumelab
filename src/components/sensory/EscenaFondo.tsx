'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FAMILIAS } from '@/lib/families';
import type { FamiliaKey } from '@/types';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Fondo ambiental por escena/ingrediente.
 * - Intenta `src` (foto de la opción); si falla, `fallbackSrc` (foto de familia);
 *   si tampoco, queda el color profundo de la familia.
 * - Scrim oscuro encima para que el texto siga legible.
 * - Lento Ken Burns + crossfade al cambiar de escena.
 */
export function EscenaFondo({
  src,
  fallbackSrc,
  familia,
  prominencia = 'sutil',
}: {
  src?: string;
  fallbackSrc?: string;
  familia: FamiliaKey;
  prominencia?: 'sutil' | 'alta';
}) {
  const [fallidas, setFallidas] = useState<Record<string, true>>({});
  const f = FAMILIAS[familia];

  const candidatos = [src, fallbackSrc].filter(Boolean) as string[];
  const usable = candidatos.find((c) => !fallidas[c]) ?? null;
  const alta = prominencia === 'alta';
  const imgOpacity = alta ? 0.85 : 0.5;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: f.colorDeep }}>
      <AnimatePresence>
        {usable && (
          <motion.img
            key={usable}
            src={usable}
            alt=""
            aria-hidden
            onError={() => setFallidas((prev) => ({ ...prev, [usable]: true }))}
            initial={{ opacity: 0, scale: 1.07 }}
            animate={{ opacity: imgOpacity, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.2, ease: EASE }, scale: { duration: 9, ease: 'easeOut' } }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </AnimatePresence>

      {/* Tinte de familia (cohesión cromática) */}
      <div
        className="absolute inset-0 opacity-35 mix-blend-soft-light"
        style={{ background: f.color }}
        aria-hidden
      />
      {/* Scrim para legibilidad */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background: `linear-gradient(to bottom, rgba(21,18,13,${alta ? 0.5 : 0.78}) 0%, rgba(21,18,13,${alta ? 0.34 : 0.6}) 38%, rgba(21,18,13,${alta ? 0.66 : 0.9}) 100%)`,
        }}
      />
    </div>
  );
}
