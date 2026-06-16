import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { FAMILIAS } from '@/lib/families';
import type { FamiliaKey } from '@/types';
import { Aura } from '@/components/sensory/Aura';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { EstadoPantalla, LinkBoton } from '@/components/checkout/EstadoPantalla';
import type {
  FormatoView,
  FraganciaView,
  PackagingView,
} from '@/components/checkout/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Confirma tu fragancia, elige su formato y completa tu pedido.',
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { perfil?: string };
}) {
  const perfilId = searchParams.perfil;

  if (!perfilId) {
    return <PantallaSinPerfil />;
  }

  const perfil = await prisma.perfilOlfativo.findUnique({
    where: { id: perfilId },
    include: {
      combinacion: {
        include: {
          base: true,
          modificador: true,
          productos: {
            where: { activo: true },
            orderBy: { precio: 'asc' },
          },
        },
      },
    },
  });

  if (!perfil) {
    return <PantallaSinPerfil />;
  }

  const productosActivos = perfil.combinacion.productos;
  if (productosActivos.length === 0) {
    return (
      <EstadoPantalla
        eyebrow="Perfume Lab"
        titulo="Esta fragancia aún no está disponible"
        mensaje="No encontramos formatos a la venta para tu diseño. Vuelve a empezar el ritual y exploremos otra dirección."
      >
        <LinkBoton href="/ritual">Empezar el ritual</LinkBoton>
      </EstadoPantalla>
    );
  }

  const packagingOpciones = await prisma.packagingOpcion.findMany({
    where: { activo: true },
    orderBy: { precioExtra: 'asc' },
  });

  const familiaKey = perfil.combinacion.base.familiaOlfativa as FamiliaKey;

  const fragancia: FraganciaView = {
    perfilId: perfil.id,
    nombreFragancia: perfil.nombreFragancia,
    baseNombre: perfil.combinacion.base.nombre,
    familia: familiaKey,
    familiaNombre: FAMILIAS[familiaKey].nombre,
    notasCabeza: perfil.combinacion.base.notasCabeza,
    notasCorazon: perfil.combinacion.base.notasCorazon,
    notasFondo: perfil.combinacion.base.notasFondo,
  };

  const formatos: FormatoView[] = productosActivos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    ml: p.ml,
    precio: p.precio,
  }));

  const packaging: PackagingView[] = packagingOpciones.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    precioExtra: p.precioExtra,
  }));

  return (
    <Aura familia={familiaKey} intensity={0.16} className="min-h-[100dvh]">
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
        <header className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-ink-muted">
            Perfume Lab Chile
          </p>
          <h1 className="mt-3 text-balance text-4xl text-ink sm:text-5xl">
            Cierra tu ritual
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Revisa la fragancia que diseñaste, elige cómo la quieres y la preparamos a
            mano sólo para ti.
          </p>
        </header>

        <CheckoutForm fragancia={fragancia} formatos={formatos} packaging={packaging} />
      </main>
    </Aura>
  );
}

function PantallaSinPerfil() {
  return (
    <EstadoPantalla
      eyebrow="Perfume Lab"
      titulo="Empieza el ritual"
      mensaje="Para llegar al checkout primero diseñamos tu fragancia. Es un viaje breve: unas pocas preguntas y revelamos quién eres en aroma."
    >
      <LinkBoton href="/ritual">Diseñar mi fragancia</LinkBoton>
      <LinkBoton href="/" variant="ghost">
        Volver al inicio
      </LinkBoton>
    </EstadoPantalla>
  );
}
