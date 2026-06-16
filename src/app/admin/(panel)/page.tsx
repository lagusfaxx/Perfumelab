import Link from 'next/link';
import type { EstadoPedido } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { formatCLP } from '@/lib/utils';
import { FAMILIAS } from '@/lib/families';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Resumen · Admin',
};

// Estados que cuentan como venta efectiva.
const VENTA_ESTADOS: EstadoPedido[] = [
  'PAGADO',
  'EN_PREPARACION',
  'ENVIADO',
  'ENTREGADO',
];

function parseFecha(v: string | undefined): Date | null {
  if (!v) return null;
  const d = new Date(`${v}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-medium text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

function familiaLabel(key: string): string {
  return (FAMILIAS as Record<string, { nombre: string }>)[key]?.nombre ?? key;
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { desde?: string; hasta?: string };
}) {
  const now = new Date();
  const defaultDesde = new Date(now);
  defaultDesde.setDate(defaultDesde.getDate() - 30);

  const desde = parseFecha(searchParams?.desde) ?? defaultDesde;
  const hastaRaw = parseFecha(searchParams?.hasta) ?? now;
  // hasta inclusivo: sumamos un día para el límite superior (lt).
  const hastaLt = new Date(hastaRaw);
  hastaLt.setDate(hastaLt.getDate() + 1);

  const rango = { gte: desde, lt: hastaLt };

  const [ventaAgg, pendientesCount, ventaPedidos] = await Promise.all([
    prisma.pedido.aggregate({
      _sum: { montoTotal: true },
      _count: { _all: true },
      where: { estado: { in: VENTA_ESTADOS }, createdAt: rango },
    }),
    prisma.pedido.count({ where: { estado: 'PENDIENTE' } }),
    prisma.pedido.findMany({
      where: { estado: { in: VENTA_ESTADOS }, createdAt: rango },
      select: {
        perfil: {
          select: {
            combinacion: {
              select: {
                base: { select: { nombre: true, familiaOlfativa: true } },
              },
            },
          },
        },
      },
    }),
  ]);

  const ventas = ventaAgg._sum.montoTotal ?? 0;
  const nPedidos = ventaAgg._count._all ?? 0;
  const ticket = nPedidos > 0 ? Math.round(ventas / nPedidos) : 0;

  // Agregaciones en JS: bases y familias más pedidas.
  const baseCount = new Map<string, number>();
  const familiaCount = new Map<string, number>();
  for (const p of ventaPedidos) {
    const base = p.perfil?.combinacion?.base;
    if (!base) continue;
    baseCount.set(base.nombre, (baseCount.get(base.nombre) ?? 0) + 1);
    familiaCount.set(
      base.familiaOlfativa,
      (familiaCount.get(base.familiaOlfativa) ?? 0) + 1
    );
  }

  const topBases = [...baseCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const topFamilias = [...familiaCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ink">Resumen</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Período: {ymd(desde)} a {ymd(hastaRaw)}
          </p>
        </div>

        <form method="GET" className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col text-xs text-ink-soft">
            Desde
            <input
              type="date"
              name="desde"
              defaultValue={ymd(desde)}
              className="mt-1 rounded-xl border border-ink/10 bg-canvas-soft px-3 py-2 text-sm text-ink focus:border-brass/60 focus:outline-none"
            />
          </label>
          <label className="flex flex-col text-xs text-ink-soft">
            Hasta
            <input
              type="date"
              name="hasta"
              defaultValue={ymd(hastaRaw)}
              className="mt-1 rounded-xl border border-ink/10 bg-canvas-soft px-3 py-2 text-sm text-ink focus:border-brass/60 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-full border border-brass/40 px-4 py-2 text-sm text-brass transition-colors hover:bg-brass/10"
          >
            Aplicar
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Ventas del período" value={formatCLP(ventas)} />
        <MetricCard label="Pedidos pagados" value={String(nPedidos)} />
        <MetricCard
          label="Ticket promedio"
          value={formatCLP(ticket)}
          hint="Ventas / nº pedidos"
        />
        <MetricCard
          label="Pedidos pendientes"
          value={String(pendientesCount)}
          hint="Esperando pago"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="text-lg text-ink">Bases más pedidas</h2>
          {topBases.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">Sin datos en el período.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topBases.map(([nombre, count]) => (
                <li
                  key={nombre}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-ink-soft">{nombre}</span>
                  <span className="font-medium text-brass">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="text-lg text-ink">Familias más pedidas</h2>
          {topFamilias.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">Sin datos en el período.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {topFamilias.map(([fam, count]) => (
                <li
                  key={fam}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-ink-soft">{familiaLabel(fam)}</span>
                  <span className="font-medium text-brass">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-2 rounded-full border border-brass/40 px-5 py-2.5 text-sm text-brass transition-colors hover:bg-brass/10"
        >
          Ver todos los pedidos →
        </Link>
      </div>
    </div>
  );
}
