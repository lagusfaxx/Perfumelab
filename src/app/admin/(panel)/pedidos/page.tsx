import Link from 'next/link';
import type { EstadoPedido, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { formatCLP, formatFecha } from '@/lib/utils';
import { EstadoBadge, ESTADOS, ESTADO_LABEL } from '@/components/admin/estado';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pedidos · Admin',
};

const MAX_ROWS = 200;

function isEstado(v: string): v is EstadoPedido {
  return (ESTADOS as string[]).includes(v);
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: { estado?: string; q?: string };
}) {
  const estadoParam = searchParams?.estado?.trim() ?? '';
  const q = searchParams?.q?.trim() ?? '';

  const where: Prisma.PedidoWhereInput = {};
  if (estadoParam && isEstado(estadoParam)) {
    where.estado = estadoParam;
  }
  if (q) {
    where.OR = [
      { numero: { contains: q, mode: 'insensitive' } },
      { clienteNombre: { contains: q, mode: 'insensitive' } },
      { clienteEmail: { contains: q, mode: 'insensitive' } },
      { nombreFraganciaCliente: { contains: q, mode: 'insensitive' } },
    ];
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: MAX_ROWS,
    select: {
      id: true,
      numero: true,
      createdAt: true,
      clienteNombre: true,
      clienteEmail: true,
      nombreFraganciaCliente: true,
      formatoLabel: true,
      montoTotal: true,
      estado: true,
    },
  });

  const exportQs = new URLSearchParams();
  if (estadoParam) exportQs.set('estado', estadoParam);
  if (q) exportQs.set('q', q);
  const exportHref = `/api/admin/pedidos/export${
    exportQs.toString() ? `?${exportQs.toString()}` : ''
  }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl text-ink">Pedidos</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {pedidos.length} resultado{pedidos.length === 1 ? '' : 's'}
            {pedidos.length === MAX_ROWS ? ` (máx ${MAX_ROWS})` : ''}
          </p>
        </div>
        <Link
          href={exportHref}
          className="rounded-full border border-brass/40 px-4 py-2 text-sm text-brass transition-colors hover:bg-brass/10"
        >
          Exportar CSV
        </Link>
      </div>

      <form
        method="GET"
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-canvas-soft/50 p-4"
      >
        <label className="flex flex-col text-xs text-ink-soft">
          Estado
          <select
            name="estado"
            defaultValue={estadoParam}
            className="mt-1 min-w-[12rem] appearance-none rounded-xl border border-ink/10 bg-canvas-soft px-3 py-2 text-sm text-ink focus:border-brass/60 focus:outline-none"
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ESTADO_LABEL[e]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-1 flex-col text-xs text-ink-soft">
          Buscar
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Número, cliente, correo o fragancia"
            className="mt-1 w-full rounded-xl border border-ink/10 bg-canvas-soft px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-brass/60 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="rounded-full bg-brass px-5 py-2 text-sm font-medium text-canvas transition-colors hover:bg-brass-soft"
        >
          Filtrar
        </button>
        <Link
          href="/admin/pedidos"
          className="rounded-full px-3 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Limpiar
        </Link>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-ink/10">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-canvas-soft/60 text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Número</th>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Fragancia</th>
              <th className="px-4 py-3 font-medium">Formato</th>
              <th className="px-4 py-3 text-right font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink-muted">
                  No hay pedidos que coincidan con el filtro.
                </td>
              </tr>
            ) : (
              pedidos.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-ink/10 transition-colors hover:bg-ink/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pedidos/${p.id}`}
                      className="font-medium text-brass hover:underline"
                    >
                      {p.numero}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-soft">
                    {formatFecha(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    <div className="text-ink">{p.clienteNombre}</div>
                    <div className="text-xs text-ink-muted">{p.clienteEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {p.nombreFraganciaCliente}
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{p.formatoLabel}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-ink">
                    {formatCLP(p.montoTotal)}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={p.estado} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
