import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { score } from '@/lib/mapping';
import { INTENSIDAD_LABEL } from '@/lib/families';
import type { FamiliaKey, PreferenceVector } from '@/types';
import { Revelacion } from '@/components/ritual/Revelacion';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const perfil = await prisma.perfilOlfativo.findUnique({
    where: { id: params.id },
    select: { nombreFragancia: true },
  });
  const nombre = perfil?.nombreFragancia ?? 'Tu fragancia';
  return {
    title: nombre,
    description: `"${nombre}" — la fragancia que el ritual reveló para ti.`,
  };
}

export default async function RevelacionPage({
  params,
}: {
  params: { id: string };
}) {
  const perfil = await prisma.perfilOlfativo.findUnique({
    where: { id: params.id },
    include: {
      combinacion: { include: { base: true, modificador: true, productos: true } },
    },
  });
  if (!perfil) notFound();

  const base = perfil.combinacion.base;
  const familia = base.familiaOlfativa as FamiliaKey;
  const userVec = perfil.vectorJson as unknown as PreferenceVector;
  const combVec = perfil.combinacion.vectorJson as unknown as PreferenceVector;
  const afinidad = Math.round(score(userVec, combVec) * 100);

  const precios = perfil.combinacion.productos
    .filter((p) => p.activo)
    .map((p) => p.precio);
  const desde = precios.length ? Math.min(...precios) : perfil.combinacion.precioBase;

  const alternativas =
    (perfil.alternativasJson as unknown as {
      nombre: string;
      sku: string;
      score: number;
    }[]) ?? [];

  // Intensidad (proyección) y estela (duración/sillage) para los medidores.
  const intensidad = typeof combVec.intensidad === 'number' ? combVec.intensidad : 0.6;
  const estelaPorTipo: Record<string, number> = { EDT: 0.42, EDP: 0.72, PARFUM: 0.95 };
  const estela = estelaPorTipo[perfil.combinacion.intensidad] ?? 0.6;

  return (
    <Revelacion
      perfilId={perfil.id}
      nombreInicial={perfil.nombreFragancia}
      vector={userVec}
      familia={familia}
      baseNombre={base.nombre}
      baseDescripcion={base.descripcion ?? ''}
      intensidadLabel={INTENSIDAD_LABEL[perfil.combinacion.intensidad]}
      notas={{
        cabeza: base.notasCabeza,
        corazon: base.notasCorazon,
        fondo: base.notasFondo,
      }}
      desde={desde}
      afinidad={afinidad}
      intensidad={intensidad}
      estela={estela}
      alternativas={alternativas.map((a) => ({ nombre: a.nombre, score: Math.round(a.score * 100) }))}
    />
  );
}
