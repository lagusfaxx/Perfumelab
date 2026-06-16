'use client';

import { motion } from 'framer-motion';
import { FAMILIAS } from '@/lib/families';
import type { RitualOption } from '@/types';
import { cn } from '@/lib/utils';

export function OptionCard({
  option,
  index,
  selected,
  onSelect,
  disabled,
}: {
  option: RitualOption;
  index: number;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const accent = option.familiaAcento ? FAMILIAS[option.familiaAcento].color : '#c9a44c';

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: disabled ? 1 : 1.015 }}
      whileTap={{ scale: 0.985 }}
      aria-pressed={selected}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border px-5 py-4 text-left transition-colors duration-300',
        'glass',
        selected
          ? 'border-transparent'
          : 'border-ink/10 hover:border-ink/25'
      )}
      style={
        selected
          ? { boxShadow: `0 0 0 1px ${accent}, 0 0 40px -8px ${accent}` }
          : undefined
      }
    >
      {/* lavado de color al seleccionar */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          opacity: selected ? 0.16 : undefined,
          background: `radial-gradient(circle at 12% 50%, ${accent}, transparent 60%)`,
        }}
      />
      <span className="relative flex items-center gap-3">
        <span
          className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full transition-transform duration-300"
          style={{ background: accent, transform: selected ? 'scale(1.5)' : 'scale(1)' }}
        />
        <span>
          <span className="block font-serif text-lg text-ink">{option.label}</span>
          {option.hint && (
            <span className="mt-0.5 block text-sm text-ink-muted">{option.hint}</span>
          )}
        </span>
      </span>
    </motion.button>
  );
}
