import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatCLP, formatFecha, formatRut } from '@/lib/utils';
import { INTENSIDAD_LABEL, FAMILIAS } from '@/lib/families';
import { EstadoBadge, ESTADOS, ESTADO_LABEL } from '@/components/admin/estado';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pedido · Admin',
};

function familiaLabel(key: string): string {
  return (FAMILIAS as Record<string, { nombre: string }>)[key]?.nombre ?? key;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right text-ink-soft">{value}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="glass rounded-2xl p-5">
      <h2 className="mb-3 text-base text-ink">{title}</h2>
      {children}
    </section>
  );
}

export default async function PedidoDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: {
      perfil: {
        include: {
          combinacion: { include: { base: true, modificador: true } },
        },
      },
      producto: true,
      packaging: true,
    },
  });

  if (!pedido) notFound();

  const comb = pedido.perfil.combinacion;
  const base = comb.base;
  const mod = comb.modificador;
  const intensidadLabel = INTENSIDAD_LABEL[comb.intensidad] ?? comb.intensidad;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/pedidos"
            className="text-sm text-ink-muted transition-colors hover:text-ink"
          >
            ← Pedidos
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl text-ink">{pedido.numero}</h1>
            <EstadoBadge estado={pedido.estado} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            Creado {formatFecha(pedido.createdAt)} · Actualizado{' '}
            {formatFecha(pedido.updatedAt)}
          </p>
        </div>

        <Link
          href={`/admin/pedidos/${pedido.id}/ficha`}
          target="_blank"
          className="rounded-full border border-brass/40 px-5 py-2.5 text-sm text-brass transition-colors hover:bg-brass/10"
        >
          Ficha de producción
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Fragancia diseñada">
          <div className="mb-3 rounded-xl border border-brass/30 bg-brass/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-brass">
              Nombre del cliente (etiqueta)
            </p>
            <p className="mt-0.5 text-lg text-ink">
              {pedido.nombreFraganciaCliente}
            </p>
          </div>
          <Row
            label="Base"
            value={`${base.nombre} · ${familiaLabel(base.familiaOlfativa)}`}
          />
          <Row
            label="Modificador"
            value={
              mod
                ? `${mod.nombre} · ${comb.modPorcentaje}%`
                : 'Sin modificador'
            }
          />
          <Row label="Intensidad" value={intensidadLabel} />
          <Row label="Formato" value={pedido.formatoLabel} />
          <Row label="SKU" value={comb.sku} />
        </Section>

        <Section title="Montos">
          <Row label="Producto" value={formatCLP(pedido.montoProducto)} />
          <Row label="Packaging" value={formatCLP(pedido.montoPackaging)} />
          <Row label="Envío" value={formatCLP(pedido.montoEnvio)} />
          <div className="mt-2 flex justify-between border-t border-ink/10 pt-3 text-sm">
            <span className="font-medium text-ink">Total</span>
            <span className="font-medium text-brass">
              {formatCLP(pedido.montoTotal)}
            </span>
          </div>
          {pedido.packaging.length > 0 && (
            <p className="mt-3 text-xs text-ink-muted">
              Add-ons: {pedido.packaging.map((pk) => pk.nombre).join(' + ')}
            </p>
          )}
        </Section>

        <Section title="Cliente">
          <Row label="Nombre" value={pedido.clienteNombre} />
          <Row label="RUT" value={formatRut(pedido.clienteRut)} />
          <Row label="Correo" value={pedido.clienteEmail} />
          <Row label="Teléfono" value={pedido.clienteTelefono} />
        </Section>

        <Section title="Envío">
          <Row label="Región" value={pedido.dirRegion} />
          <Row label="Comuna" value={pedido.dirComuna} />
          <Row
            label="Dirección"
            value={`${pedido.dirCalle} ${pedido.dirNumero}`}
          />
          <Row label="Depto / casa" value={pedido.dirDepto || '—'} />
          <Row label="Referencias" value={pedido.dirReferencias || '—'} />
        </Section>

        <Section title="Pago / FLOW">
          <Row label="Estado" value={<EstadoBadge estado={pedido.estado} />} />
          <Row
            label="flowStatus"
            value={pedido.flowStatus !== null ? pedido.flowStatus : '—'}
          />
          <Row label="flowOrder" value={pedido.flowOrder || '—'} />
          <Row
            label="flowToken"
            value={
              pedido.flowToken
                ? `${pedido.flowToken.slice(0, 12)}…`
                : '—'
            }
          />
          <Row
            label="Pagado el"
            value={pedido.paidAt ? formatFecha(pedido.paidAt) : '—'}
          />
        </Section>

        <Section title="Notas internas">
          <Row
            label="Tracking de envío"
            value={pedido.trackingEnvio || '—'}
          />
          <div className="pt-1.5 text-sm">
            <span className="text-ink-muted">Nota de producción</span>
            <p className="mt-1 whitespace-pre-wrap text-ink-soft">
              {pedido.notaProduccion || '—'}
            </p>
          </div>
        </Section>
      </div>

      <Section title="Actualizar estado">
        <form
          method="POST"
          action={`/api/admin/pedidos/${pedido.id}/estado`}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <label className="flex flex-col text-xs text-ink-soft">
            Estado
            <select
              name="estado"
              defaultValue={pedido.estado}
              className="mt-1 appearance-none rounded-xl border border-ink/10 bg-canvas-soft px-3 py-2.5 text-sm text-ink focus:border-brass/60 focus:outline-none"
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {ESTADO_LABEL[e]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-xs text-ink-soft">
            Tracking de envío (opcional)
            <input
              type="text"
              name="trackingEnvio"
              defaultValue={pedido.trackingEnvio ?? ''}
              placeholder="Código de seguimiento"
              className="mt-1 rounded-xl border border-ink/10 bg-canvas-soft px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brass/60 focus:outline-none"
            />
          </label>

          <label className="flex flex-col text-xs text-ink-soft sm:col-span-2">
            Nota de producción (opcional)
            <textarea
              name="notaProduccion"
              defaultValue={pedido.notaProduccion ?? ''}
              rows={3}
              placeholder="Observaciones internas…"
              className="mt-1 min-h-[88px] resize-y rounded-xl border border-ink/10 bg-canvas-soft px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-brass/60 focus:outline-none"
            />
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-full bg-brass px-6 py-2.5 text-sm font-medium text-canvas shadow-lg shadow-brass/20 transition-colors hover:bg-brass-soft"
            >
              Guardar
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
}
