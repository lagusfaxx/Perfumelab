import { procesarToken } from '../_procesar';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Webhook de FLOW (urlConfirmation) — FUENTE DE VERDAD del pago.
 * FLOW envía application/x-www-form-urlencoded con `token`.
 * SIEMPRE responde 'ok' 200 rápidamente (tras intentar la actualización)
 * para que FLOW no entre en tormenta de reintentos.
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const token = form.get('token');

    if (typeof token === 'string' && token.length > 0) {
      // procesarToken es idempotente y nunca lanza.
      await procesarToken(token);
    } else {
      console.warn('[flow/confirm] webhook sin token');
    }
  } catch (err) {
    // Nunca propagar: responder 200 igualmente para evitar reintentos en bucle.
    console.error('[flow/confirm] error procesando webhook', err);
  }

  return new Response('ok', { status: 200 });
}
