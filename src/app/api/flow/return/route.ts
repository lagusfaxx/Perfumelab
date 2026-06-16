import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { procesarToken } from '../_procesar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Retorno del navegador desde FLOW (urlReturn). FLOW hace POST con `token`.
 * Mejor-esfuerzo: actualizamos el pedido para que la página de resultado
 * esté fresca, y redirigimos (303) a /pago/retorno?token=...
 */
export async function POST(req: Request) {
  let token: string | null = null;
  try {
    const form = await req.formData();
    const t = form.get('token');
    if (typeof t === 'string' && t.length > 0) token = t;
  } catch (err) {
    console.error('[flow/return] error leyendo formData', err);
  }

  if (!token) {
    return NextResponse.redirect(new URL('/', env.appUrl), { status: 303 });
  }

  // Mejor-esfuerzo: la fuente de verdad sigue siendo el webhook /confirm.
  try {
    await procesarToken(token);
  } catch (err) {
    console.error('[flow/return] error procesando token', err);
  }

  const destino = new URL('/pago/retorno', env.appUrl);
  destino.searchParams.set('token', token);
  return NextResponse.redirect(destino, { status: 303 });
}

/** Por si FLOW (o un usuario) llega por GET, redirigir igualmente. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return NextResponse.redirect(new URL('/', env.appUrl), { status: 303 });
  }
  try {
    await procesarToken(token);
  } catch (err) {
    console.error('[flow/return] error procesando token (GET)', err);
  }
  const destino = new URL('/pago/retorno', env.appUrl);
  destino.searchParams.set('token', token);
  return NextResponse.redirect(destino, { status: 303 });
}
