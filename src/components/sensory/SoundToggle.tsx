'use client';

import { motion } from 'framer-motion';
import { useSound } from './SoundProvider';
import { cn } from '@/lib/utils';

/** Toggle de audio ambiental. Nunca autoplay: el usuario decide. */
export function SoundToggle({ className }: { className?: string }) {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Silenciar ambiente sonoro' : 'Activar ambiente sonoro'}
      className={cn(
        'group glass flex items-center gap-2 rounded-full px-3 py-2 text-xs text-ink-soft transition-colors hover:text-ink',
        className
      )}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="mx-px w-0.5 rounded-full bg-brass"
            animate={
              enabled
                ? { height: ['6px', '14px', '6px'] }
                : { height: '4px' }
            }
            transition={
              enabled
                ? { duration: 0.9 + i * 0.25, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.2 }
            }
          />
        ))}
      </span>
      <span className="hidden sm:inline">{enabled ? 'Ambiente' : 'Silencio'}</span>
    </button>
  );
}
