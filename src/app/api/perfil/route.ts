import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { respuestasToVector, rankear } from '@/lib/mapping';
import { generarNombre } from '@/lib/naming';
import type { PreferenceVector } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  respuestas: z.record(z.string(), z.string()),
  nombre: z.string().trim().min(1).max(60).optional(),
});

/**
 * Cierra el ritual: respuestas → vector → scoring server-side (autoritativo) →
 * crea el PerfilOlfativo con su mejor match + alternativas + nombre autogenerado.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Respuestas inválidas' }, { status: 400 });
  }
  const { respuestas, nombre } = parsed.data;

  const vector = respuestasToVector(respuestas);

  const combinaciones = await prisma.combinacion.findMany({
    where: { activo: true },
    include: { base: true },
  });
  if (combinaciones.length === 0) {
    return NextResponse.json(
      { error: 'No hay fragancias disponibles. Intenta más tarde.' },
      { status: 503 }
    );
  }

  const ranked = rankear(
    vector,
    combinaciones.map((c) => ({
      id: c.id,
      sku: c.sku,
      vector: c.vectorJson as unknown as PreferenceVector,
    }))
  );

  const byId = new Map(combinaciones.map((c) => [c.id, c]));
  const best = ranked[0];

  // Alternativas: hasta 2, con base distinta a la principal (y entre sí).
  const alternativas: { combinacionId: string; sku: string; score: number; nombre: string }[] = [];
  const usadas = new Set([byId.get(best.combinacionId)?.baseId]);
  for (const r of ranked.slice(1)) {
    const c = byId.get(r.combinacionId)!;
    if (usadas.has(c.baseId)) continue;
    alternativas.push({
      combinacionId: c.id,
      sku: c.sku,
      score: Number(r.score.toFixed(4)),
      nombre: c.base.nombre,
    });
    usadas.add(c.baseId);
    if (alternativas.length >= 2) break;
  }

  const nombreFragancia = nombre ?? generarNombre(vector, best.sku);

  const perfil = await prisma.perfilOlfativo.create({
    data: {
      respuestasJson: respuestas,
      vectorJson: vector as unknown as object,
      combinacionId: best.combinacionId,
      alternativasJson: alternativas,
      nombreFragancia,
    },
  });

  return NextResponse.json({
    id: perfil.id,
    nombreFragancia: perfil.nombreFragancia,
    score: Number(best.score.toFixed(4)),
  });
}
