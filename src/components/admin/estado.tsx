import type { EstadoPedido } from '@prisma/client';
import { cn } from '@/lib/utils';

/** Etiquetas legibles en español de cada estado de pedido. */
export const ESTADO_LABEL: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  RECHAZADO: 'Rechazado',
  EN_PREPARACION: 'En preparación',
  ENVIADO: 'Enviado',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};

/** Orden de presentación / lista completa de estados. */
export const ESTADOS: EstadoPedido[] = [
  'PENDIENTE',
  'PAGADO',
  'RECHAZADO',
  'EN_PREPARACION',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
];

const ESTADO_CLASSES: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PAGADO: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  RECHAZADO: 'bg-red-500/15 text-red-300 border-red-500/30',
  EN_PREPARACION: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  ENVIADO: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  ENTREGADO: 'bg-green-500/15 text-green-300 border-green-500/30',
  CANCELADO: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
};

export function EstadoBadge({
  estado,
  className,
}: {
  estado: EstadoPedido;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        ESTADO_CLASSES[estado],
        className
      )}
    >
      {ESTADO_LABEL[estado]}
    </span>
  );
}
