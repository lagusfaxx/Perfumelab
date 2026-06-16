'use client';

import { motion } from 'framer-motion';
import { FAMILIAS } from '@/lib/families';
import type { RitualOption } from '@/types';
import { cn } from '@/lib/utils';

const CLAY = '#c0875c';

export function OptionCard({
  option,
  index,
  selected,
  onSelect,
  onPreview,
  disabled,
}: {
  option: RitualOption;
  index: number;
  selected: boolean;
  onSelect: () => void;
  onPreview?: (option: RitualOption | null) => void;
  disabled?: boolean;
}) {
  const accent = option.familiaAcento ? FAMILIAS[option.familiaAcento].color : CLAY;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => onPreview?.(option)}
      onMouseLeave={() => onPreview?.(null)}
      onFocus={() => onPreview?.(option)}
      disabled={disabled}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.99 }}
      aria-pressed={selected}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border px-5 py-4 text-left transition-colors duration-300',
        selected ? 'bg-canvas-soft/70' : 'border-ink/10 bg-canvas-soft/30 hover:border-ink/25'
      )}
      style={selected ? { borderColor: accent } : undefined}
    >
      {/* lavado de color muy sutil al elegir/hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1 transition-all duration-500"
        style={{
          background: accent,
          opacity: selected ? 0.9 : 0.0,
        }}
      />
      <span className="relative flex items-start gap-3">
        <span
          className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full transition-transform duration-300"
          style={{ background: accent, transform: selected ? 'scale(1.6)' : 'scale(1)' }}
        />
        <span className="min-w-0">
          <span className="block font-serif text-lg leading-snug text-ink">{option.label}</span>
          {(option.aroma || option.hint) && (
            <span className="mt-1 block text-sm leading-snug text-ink-muted">
              {option.aroma ?? option.hint}
            </span>
          )}
        </span>
      </span>
    </motion.button>
  );
}
