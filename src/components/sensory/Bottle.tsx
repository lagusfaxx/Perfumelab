'use client';

import { motion } from 'framer-motion';
import { FAMILIAS } from '@/lib/families';
import type { FamiliaKey } from '@/types';

/** Frasco que respira y flota, con luz interior que cambia por familia. */
export function Bottle({
  familia = 'ORIENTALES',
  size = 160,
}: {
  familia?: FamiliaKey;
  size?: number;
}) {
  const f = FAMILIAS[familia];
  return (
    <motion.div
      style={{ width: size, height: size * 1.4 }}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
      aria-hidden
    >
      {/* halo */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-full blur-2xl"
        style={{ background: f.color }}
        animate={{ opacity: [0.25, 0.5, 0.25], scale: [0.9, 1.05, 0.9] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <svg viewBox="0 0 100 140" width="100%" height="100%">
        <defs>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={f.colorSoft} stopOpacity="0.55" />
            <stop offset="50%" stopColor={f.color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={f.colorDeep} stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={f.color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={f.colorDeep} stopOpacity="0.95" />
          </linearGradient>
        </defs>
        {/* tapa */}
        <rect x="40" y="4" width="20" height="14" rx="3" fill={f.colorDeep} opacity="0.9" />
        <rect x="43" y="16" width="14" height="8" fill={f.colorDeep} opacity="0.7" />
        {/* cuerpo */}
        <rect x="24" y="24" width="52" height="100" rx="14" fill="url(#glass)" stroke={f.colorSoft} strokeOpacity="0.4" />
        {/* líquido */}
        <motion.rect
          x="28"
          width="44"
          rx="10"
          fill="url(#liquid)"
          initial={{ y: 70, height: 50 }}
          animate={{ y: [70, 66, 70], height: [50, 54, 50] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* reflejo */}
        <rect x="32" y="34" width="6" height="78" rx="3" fill="#fff" opacity="0.12" />
        {/* etiqueta */}
        <rect x="34" y="66" width="32" height="34" rx="3" fill="#0c0a0d" opacity="0.45" />
        <line x1="40" y1="78" x2="60" y2="78" stroke={f.colorSoft} strokeOpacity="0.5" strokeWidth="1" />
        <line x1="42" y1="86" x2="58" y2="86" stroke={f.colorSoft} strokeOpacity="0.3" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}
