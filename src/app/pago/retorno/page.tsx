import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { FAMILIAS } from '@/lib/families';
import { formatCLP } from '@/lib/utils';
import type { FamiliaKey } from '@/types';
import { EstadoPantalla, LinkBoton } from '@/components/checkout/EstadoPantalla';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Resultado del pago',
  robots: { index: false, follow: false },
};

export default async function RetornoPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return <NoEncontrado />;
  }

  const pedido = await prisma.pedido.findUnique({
    where: { flowToken: token },
    include: {
      perfil: { include: { combinacion: { include: { base: true } } } },
    },
  });

  if (!pedido) {
    return <NoEncontrado />;
  }

  const familiaKey = pedido.perfil.combinacion.base.familiaOlfativa as FamiliaKey;

  // ── PAGADO ──
  if (pedido.estado === 'PAGADO') {
    return (
      <EstadoPantalla
        eyebrow="Pago confirmado"
        titulo={pedido.nombreFraganciaCliente}
        familia={familiaKey}
        intensity={0.3}
        mensaje={
          <>
            <p>
              Tu fragancia está en producción. La preparamos a mano, sólo para ti, y
              pronto saldrá a tu puerta.
            </p>
            <p className="mt-3">
              Te enviamos la confirmación a{' '}
              <span className="text-ink">{pedido.clienteEmail}</span>. Revisa tu correo
              (y la carpeta de spam, por si acaso).
            </p>
          </>
        }
      >
        <ResumenPill
          numero={pedido.numero}
          detalle={`${FAMILIAS[familiaKey].nombre} · ${pedido.formatoLabel}`}
          total={pedido.montoTotal}
        />
        <LinkBoton href="/">Volver al inicio</LinkBoton>
      </EstadoPantalla>
    );
  }

  // ── RECHAZADO ──
  if (pedido.estado === 'RECHAZADO' || pedido.estado === 'CANCELADO') {
    return (
      <EstadoPantalla
        eyebrow="Pago no completado"
        titulo="El pago no se concretó"
        mensaje={
          <>
            <p>
              No pudimos confirmar el pago de tu fragancia{' '}
              <span className="text-ink">{pedido.nombreFraganciaCliente}</span>. No se
              realizó ningún cobro.
            </p>
            <p className="mt-3">Puedes intentarlo de nuevo cuando quieras.</p>
          </>
        }
      >
        <LinkBoton href={`/checkout?perfil=${pedido.perfilId}`}>Reintentar</LinkBoton>
        <LinkBoton href="/" variant="ghost">
          Volver al inicio
        </LinkBoton>
      </EstadoPantalla>
    );
  }

  // ── PENDIENTE (o estados de preparación/envío, raros aquí) ──
  return (
    <EstadoPantalla
      eyebrow="Casi listo"
      titulo="Estamos confirmando tu pago"
      familia={familiaKey}
      intensity={0.2}
      mensaje={
        <>
          <p>
            Tu pago de{' '}
            <span className="text-ink">{pedido.nombreFraganciaCliente}</span> se está
            verificando. La confirmación llega de forma segura desde nuestro servidor, así
            que puede tardar unos instantes.
          </p>
          <p className="mt-3">
            Cuando quede confirmado te avisaremos a{' '}
            <span className="text-ink">{pedido.clienteEmail}</span>. No necesitas hacer
            nada más.
          </p>
        </>
      }
    >
      <ResumenPill numero={pedido.numero} detalle={pedido.formatoLabel} total={pedido.montoTotal} />
      <LinkBoton href="/">Volver al inicio</LinkBoton>
    </EstadoPantalla>
  );
}

function ResumenPill({
  numero,
  detalle,
  total,
}: {
  numero: string;
  detalle: string;
  total: number;
}) {
  return (
    <div className="glass w-full max-w-sm rounded-2xl px-6 py-5 text-left">
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs text-ink-muted">Pedido</span>
        <span className="font-mono text-sm text-ink">{numero}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-4">
        <span className="text-xs text-ink-muted">Detalle</span>
        <span className="text-right text-sm text-ink-soft">{detalle}</span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4 border-t border-ink/10 pt-3">
        <span className="text-xs text-ink-muted">Total</span>
        <span className="text-base text-brass">{formatCLP(total)}</span>
      </div>
    </div>
  );
}

function NoEncontrado() {
  return (
    <EstadoPantalla
      eyebrow="Perfume Lab"
      titulo="No encontramos tu pago"
      mensaje="No pudimos asociar este retorno a un pedido. Si crees que hubo un cobro, escríbenos y lo revisamos contigo."
    >
      <LinkBoton href="/">Volver al inicio</LinkBoton>
      <LinkBoton href="/ritual" variant="ghost">
        Empezar de nuevo
      </LinkBoton>
    </EstadoPantalla>
  );
}
