'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { FAMILIAS } from '@/lib/families';
import type { FamiliaKey } from '@/types';
import { Aura } from '@/components/sensory/Aura';
import { SoundToggle } from '@/components/sensory/SoundToggle';
import { useSound } from '@/components/sensory/SoundProvider';
import { FraganciaCard } from '@/components/fragancia/FraganciaCard';
import { PiramideNotas } from '@/components/fragancia/PiramideNotas';

const EASE = [0.16, 1, 0.3, 1] as const;

interface Muestra {
  familia: FamiliaKey;
  nombre: string;
  intensidadLabel: string;
  desc: string;
  notas: { cabeza: string[]; corazon: string[]; fondo: string[] };
  intensidad: number;
  estela: number;
}

const MUESTRAS: Muestra[] = [
  {
    familia: 'CITRICOS',
    nombre: 'Alba de Verano',
    intensidadLabel: 'Eau de Toilette',
    desc: 'El primer rayo en la cara. Te despierta y te limpia.',
    notas: {
      cabeza: ['Bergamota', 'Pomelo'],
      corazon: ['Neroli', 'Jengibre'],
      fondo: ['Almizcle blanco', 'Cedro claro'],
    },
    intensidad: 0.38,
    estela: 0.42,
  },
  {
    familia: 'FLORALES',
    nombre: 'Jardín de las Cinco',
    intensidadLabel: 'Eau de Parfum',
    desc: 'Pétalos en aire tibio, justo antes de que caiga el sol.',
    notas: {
      cabeza: ['Pera', 'Grosella'],
      corazon: ['Rosa', 'Jazmín', 'Peonía'],
      fondo: ['Almizcle', 'Sándalo'],
    },
    intensidad: 0.5,
    estela: 0.72,
  },
  {
    familia: 'ORIENTALES',
    nombre: 'Bruma de Medianoche',
    intensidadLabel: 'Eau de Parfum',
    desc: 'Penumbra dorada y especia. Para noches que no quieres olvidar.',
    notas: {
      cabeza: ['Cardamomo', 'Azafrán'],
      corazon: ['Rosa', 'Incienso'],
      fondo: ['Ámbar', 'Vainilla', 'Oud'],
    },
    intensidad: 0.85,
    estela: 0.92,
  },
];

export function DemoFragancia() {
  const { setScene, enabled } = useSound();
  const [i, setI] = useState(2); // arranca en la oriental (más vistosa)
  const m = MUESTRAS[i];

  useEffect(() => {
    if (enabled) setScene(m.familia);
  }, [m.familia, enabled, setScene]);

  return (
    <Aura familia={m.familia} intensity={0.18} className="rounded-3xl border border-ink/10 p-5 sm:p-8">
      {/* Selector de muestras */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {MUESTRAS.map((muestra, idx) => {
            const f = FAMILIAS[muestra.familia];
            const active = idx === i;
            return (
              <button
                key={muestra.nombre}
                onClick={() => setI(idx)}
                className="rounded-full border px-3.5 py-1.5 text-xs transition-all duration-300"
                style={{
                  borderColor: active ? f.color : 'rgba(244,238,233,0.15)',
                  color: active ? f.color : '#cabfc0',
                  background: active ? `${f.color}1a` : 'transparent',
                }}
              >
                {f.nombre}
              </button>
            );
          })}
        </div>
        <SoundToggle />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={m.nombre}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="grid items-start gap-6 md:grid-cols-2"
        >
          <div>
            <FraganciaCard
              nombre={m.nombre}
              familia={m.familia}
              intensidadLabel={m.intensidadLabel}
              notasTop={m.notas.cabeza}
            />
            <p className="mt-4 px-1 text-pretty text-base italic leading-relaxed text-ink-soft">
              {m.desc}
            </p>
            <Link
              href="/ritual"
              className="mt-5 inline-block rounded-full bg-brass px-7 py-3 text-sm font-medium text-canvas transition-all duration-300 hover:bg-brass-soft"
            >
              Ahora diseña el mío →
            </Link>
          </div>
          <PiramideNotas
            familia={m.familia}
            notas={m.notas}
            intensidad={m.intensidad}
            estela={m.estela}
          />
        </motion.div>
      </AnimatePresence>
    </Aura>
  );
}
