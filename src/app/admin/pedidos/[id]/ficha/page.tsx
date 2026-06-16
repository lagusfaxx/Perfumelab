import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatFecha } from '@/lib/utils';
import { INTENSIDAD_LABEL, FAMILIAS } from '@/lib/families';
import { PrintButton } from '@/components/admin/PrintButton';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ficha de producción',
};

function familiaLabel(key: string): string {
  return (FAMILIAS as Record<string, { nombre: string }>)[key]?.nombre ?? key;
}

interface Ficha {
  intensidad?: string;
  concentracion?: string;
  instrucciones?: string[];
  modificador?: { nombre: string; nota: string; porcentaje: number } | null;
}

function parseFicha(value: unknown): Ficha {
  if (value && typeof value === 'object') return value as Ficha;
  return {};
}

export default async function FichaProduccionPage({
  params,
}: {
  params: { id: string };
}) {
  // Defensa en profundidad (esta ruta vive fuera del route group (panel)).
  const session = await getSession();
  if (!session) redirect('/admin/login');

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
  const ficha = parseFicha(comb.fichaJson);
  const intensidadLabel = INTENSIDAD_LABEL[comb.intensidad] ?? comb.intensidad;
  const instrucciones = Array.isArray(ficha.instrucciones)
    ? ficha.instrucciones
    : [];

  const notas = [
    ...base.notasCabeza,
    ...base.notasCorazon,
    ...base.notasFondo,
  ];

  return (
    <main className="print-sheet min-h-dvh bg-white px-6 py-10 text-zinc-900">
      <style
        // Estilos de impresión: ocultar botones, blanco/negro nítido.
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              .no-print { display: none !important; }
              .print-sheet { background: #fff !important; color: #000 !important; padding: 0 !important; }
              .ficha-box { border-color: #999 !important; }
            }
            .print-sheet, .print-sheet * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          `,
        }}
      />

      <div className="mx-auto max-w-3xl">
        <div className="no-print mb-8 flex items-center justify-between gap-4">
          <Link
            href={`/admin/pedidos/${pedido.id}`}
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            ← Volver al pedido
          </Link>
          <PrintButton />
        </div>

        <header className="mb-8 border-b border-zinc-300 pb-5">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Perfume Lab Chile · Ficha de producción
          </p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="font-serif text-3xl text-zinc-900">{pedido.numero}</h1>
            <span className="text-sm text-zinc-600">
              {formatFecha(pedido.createdAt)}
            </span>
          </div>
        </header>

        {/* Etiqueta a imprimir — grande */}
        <section className="ficha-box mb-8 rounded-2xl border-2 border-zinc-800 px-6 py-7 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Etiqueta a imprimir
          </p>
          <p className="mt-3 font-serif text-4xl font-semibold text-zinc-900">
            {pedido.nombreFraganciaCliente}
          </p>
          <p className="mt-2 text-base text-zinc-600">{pedido.formatoLabel}</p>
        </section>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <section className="ficha-box rounded-xl border border-zinc-300 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Base a macerar / blendear
            </h2>
            <p className="mt-2 text-xl text-zinc-900">{base.nombre}</p>
            <p className="text-sm text-zinc-600">
              Familia: {familiaLabel(base.familiaOlfativa)}
            </p>
            {notas.length > 0 && (
              <p className="mt-3 text-sm text-zinc-700">
                <span className="font-medium">Notas:</span> {notas.join(', ')}
              </p>
            )}
          </section>

          <section className="ficha-box rounded-xl border border-zinc-300 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Modificador
            </h2>
            {mod ? (
              <>
                <p className="mt-2 text-xl text-zinc-900">{mod.nombre}</p>
                <p className="text-sm text-zinc-600">Nota: {mod.nota}</p>
                <p className="mt-2 text-2xl font-semibold text-zinc-900">
                  {comb.modPorcentaje}%
                </p>
              </>
            ) : (
              <p className="mt-2 text-xl text-zinc-700">Sin modificador</p>
            )}
          </section>

          <section className="ficha-box rounded-xl border border-zinc-300 p-5 sm:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Intensidad / concentración
            </h2>
            <p className="mt-2 text-lg text-zinc-900">
              {intensidadLabel}
              {ficha.concentracion ? ` · ${ficha.concentracion}` : ''}
            </p>

            {instrucciones.length > 0 && (
              <ul className="mt-4 space-y-2">
                {instrucciones.map((paso, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-800">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-block h-4 w-4 flex-shrink-0 rounded border border-zinc-500"
                    />
                    <span>{paso}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {pedido.packaging.length > 0 && (
          <section className="ficha-box mt-6 rounded-xl border border-zinc-300 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Packaging
            </h2>
            <p className="mt-2 text-sm text-zinc-800">
              {pedido.packaging.map((pk) => pk.nombre).join(' + ')}
            </p>
          </section>
        )}

        {pedido.notaProduccion && (
          <section className="ficha-box mt-6 rounded-xl border border-zinc-300 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Nota de producción
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">
              {pedido.notaProduccion}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
