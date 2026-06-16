import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const perfil = await prisma.perfilOlfativo.findUnique({
    where: { id: params.id },
    include: {
      combinacion: { include: { base: true, modificador: true, productos: true } },
    },
  });
  if (!perfil) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }
  return NextResponse.json(perfil);
}

const patchSchema = z.object({
  nombreFragancia: z.string().trim().min(1, 'Escribe un nombre').max(60),
  email: z.string().email().optional(),
});

/** Renombrar la fragancia (clave: la hace suya) y/o capturar email. */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  const parsed = patchSchema.partial().safeParse(body);
  if (!parsed.success || (!parsed.data.nombreFragancia && !parsed.data.email)) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  }

  try {
    const perfil = await prisma.perfilOlfativo.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.nombreFragancia ? { nombreFragancia: parsed.data.nombreFragancia } : {}),
        ...(parsed.data.email ? { email: parsed.data.email } : {}),
      },
    });
    return NextResponse.json({ id: perfil.id, nombreFragancia: perfil.nombreFragancia });
  } catch {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }
}
