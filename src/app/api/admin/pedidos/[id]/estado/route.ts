import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { EstadoPedido, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ESTADOS } from '@/components/admin/estado';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isEstado(v: string): v is EstadoPedido {
  return (ESTADOS as string[]).includes(v);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', req.url), 303);
  }

  const form = await req.formData();
  const estadoRaw = String(form.get('estado') ?? '');
  const trackingEnvio = String(form.get('trackingEnvio') ?? '').trim();
  const notaProduccion = String(form.get('notaProduccion') ?? '').trim();

  const data: Prisma.PedidoUpdateInput = {
    trackingEnvio: trackingEnvio || null,
    notaProduccion: notaProduccion || null,
  };
  if (isEstado(estadoRaw)) {
    data.estado = estadoRaw;
  }

  await prisma.pedido.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.redirect(
    new URL(`/admin/pedidos/${params.id}`, req.url),
    303
  );
}
