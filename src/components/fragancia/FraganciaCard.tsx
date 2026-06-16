import { FAMILIAS } from '@/lib/families';
import type { FamiliaKey } from '@/types';
import { cn } from '@/lib/utils';
import { Bottle } from '@/components/sensory/Bottle';

/**
 * Tarjeta de identidad de una fragancia. Mismo lenguaje visual en la
 * revelación, el checkout y la demo del landing.
 */
export function FraganciaCard({
  nombre,
  familia,
  intensidadLabel,
  notasTop,
  afinidad,
  precioDesde,
  className,
}: {
  nombre: string;
  familia: FamiliaKey;
  intensidadLabel: string;
  notasTop: string[];
  afinidad?: number;
  precioDesde?: string;
  className?: string;
}) {
  const f = FAMILIAS[familia];
  return (
    <div className={cn('glass flex items-center gap-4 rounded-2xl p-4 sm:gap-5 sm:p-5', className)}>
      <div className="shrink-0">
        <Bottle familia={familia} size={72} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="serif-soft truncate font-serif text-2xl text-ink">{nombre}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-full px-2.5 py-1" style={{ background: `${f.color}22`, color: f.color }}>
            {f.nombre}
          </span>
          <span className="rounded-full bg-ink/5 px-2.5 py-1 text-ink-soft">{intensidadLabel}</span>
          {typeof afinidad === 'number' && (
            <span className="rounded-full bg-ink/5 px-2.5 py-1 text-ink-soft">{afinidad}% para ti</span>
          )}
        </div>
        {notasTop.length > 0 && (
          <p className="mt-2.5 text-sm text-ink-muted">
            Abre con <span className="text-ink-soft">{notasTop.slice(0, 3).join(', ')}</span>
          </p>
        )}
        {precioDesde && (
          <p className="mt-1 text-sm text-brass-soft">desde {precioDesde}</p>
        )}
      </div>
    </div>
  );
}
