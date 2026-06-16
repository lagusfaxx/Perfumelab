'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { FamiliaKey } from '@/types';
import { FAMILIA_LIST } from '@/lib/families';
import { Aura } from './Aura';
import { ParticleField } from './ParticleField';
import { Bottle } from './Bottle';
import { SoundToggle } from './SoundToggle';
import { useSound } from './SoundProvider';

const EASE = [0.16, 1, 0.3, 1] as const;
const LINEAS = ['Perfume Lab', 'No elijas un perfume.', 'Diséñalo.'];

/** Hero cinematográfico de entrada: secuencia breve y saltable + invitación al ritual. */
export function Hero() {
  const reduced = useReducedMotion();
  const { setScene, enabled } = useSound();
  const [intro, setIntro] = useState(true);
  const [linea, setLinea] = useState(0);
  // La paleta "respira" rotando entre familias.
  const [familia, setFamilia] = useState<FamiliaKey>('ORIENTALES');

  // Saltar secuencia si ya se vio en la sesión o si reduce-motion.
  useEffect(() => {
    if (reduced || sessionStorage.getItem('pl_intro_seen')) {
      setIntro(false);
    }
  }, [reduced]);

  // Avance de las líneas de la intro.
  useEffect(() => {
    if (!intro) return;
    if (linea >= LINEAS.length) {
      const t = setTimeout(() => finalizarIntro(), 900);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setLinea((l) => l + 1), linea === 0 ? 1100 : 1300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro, linea]);

  // Respiración de la paleta en el hero principal.
  useEffect(() => {
    if (intro) return;
    const id = setInterval(() => {
      setFamilia((prev) => {
        const i = FAMILIA_LIST.findIndex((f) => f.key === prev);
        return FAMILIA_LIST[(i + 1) % FAMILIA_LIST.length].key;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [intro]);

  useEffect(() => {
    if (enabled) setScene(familia);
  }, [familia, enabled, setScene]);

  const finalizarIntro = () => {
    sessionStorage.setItem('pl_intro_seen', '1');
    setIntro(false);
  };

  return (
    <Aura
      familia={familia}
      intensity={0.28}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 text-center"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
        <ParticleField familia={familia} intensity={0.9} />
      </div>

      <AnimatePresence mode="wait">
        {intro ? (
          <motion.div
            key="intro"
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-canvas/40"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <AnimatePresence mode="wait">
              {linea < LINEAS.length && (
                <motion.h1
                  key={linea}
                  initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -14, filter: 'blur(8px)' }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className={
                    linea === 0
                      ? 'text-sm uppercase tracking-[0.5em] text-brass'
                      : 'text-balance font-serif text-4xl text-ink sm:text-6xl'
                  }
                >
                  {LINEAS[linea]}
                </motion.h1>
              )}
            </AnimatePresence>
            <button
              onClick={finalizarIntro}
              className="absolute bottom-10 text-xs tracking-[0.2em] text-ink-muted transition-colors hover:text-ink"
            >
              Saltar intro →
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="flex flex-col items-center"
          >
            <div className="absolute right-5 top-6 sm:right-8">
              <SoundToggle />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.4, ease: EASE }}
            >
              <Bottle familia={familia} size={150} />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="mt-8 text-xs uppercase tracking-[0.4em] text-brass"
            >
              Perfumería personalizada · Chile
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 1, ease: EASE }}
              className="mt-4 max-w-3xl text-balance font-serif text-4xl leading-tight text-ink sm:text-6xl"
            >
              El olfato no se puede mostrar.
              <br />
              <span className="text-brass-gradient">Aquí se siente.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-soft"
            >
              Un ritual de siete preguntas traduce quién eres en una fragancia única —
              con su nombre, su historia y un objeto hecho sólo para ti.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                href="/ritual"
                className="rounded-full bg-brass px-9 py-4 text-base font-medium text-canvas shadow-lg shadow-brass/25 transition-all duration-300 hover:bg-brass-soft hover:shadow-brass/40"
              >
                Comenzar el ritual
              </Link>
              <a
                href="#como-funciona"
                className="text-sm text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
              >
                Cómo funciona
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6, duration: 1 }}
              className="absolute bottom-6 flex flex-col items-center gap-1 text-ink-muted"
            >
              <span className="text-[10px] uppercase tracking-[0.3em]">Desliza</span>
              <motion.span
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity }}
              >
                ↓
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Aura>
  );
}
