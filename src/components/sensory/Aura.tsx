'use client';

import { useMemo } from 'react';
import { FAMILIAS } from '@/lib/families';
import type { FamiliaKey } from '@/types';
import { cn } from '@/lib/utils';

/** Envuelve contenido en un aura que respira con el color de la familia. */
export function Aura({
  familia,
  children,
  className,
  intensity = 0.22,
}: {
  familia: FamiliaKey | null;
  children?: React.ReactNode;
  className?: string;
  intensity?: number;
}) {
  const style = useMemo(() => {
    const f = familia ? FAMILIAS[familia] : null;
    const color = f?.color ?? '#c9a44c';
    // hex → rgba con la opacidad pedida
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return {
      '--aura-from': `rgba(${r}, ${g}, ${b}, ${intensity})`,
      '--aura-accent': color,
    } as React.CSSProperties;
  }, [familia, intensity]);

  return (
    <div className={cn('aura-stage', className)} style={style}>
      {children}
    </div>
  );
}
