import { Resend } from 'resend';
import { env } from './env';
import { formatCLP } from './utils';

/**
 * Emails transaccionales (Resend).
 * Si no hay RESEND_API_KEY configurada, se hace no-op + log (no rompe el flujo).
 */

let _resend: Resend | null = null;
function client(): Resend | null {
  const key = env.email.resendApiKey;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export interface ConfirmacionPedidoData {
  numero: string;
  clienteNombre: string;
  clienteEmail: string;
  nombreFragancia: string;
  formatoLabel: string;
  familia: string;
  notas: { cabeza: string[]; corazon: string[]; fondo: string[] };
  montoTotal: number;
  packaging: string[];
}

function html(d: ConfirmacionPedidoData): string {
  const notasLinea = (t: string, arr: string[]) =>
    arr.length ? `<p style="margin:2px 0;color:#cabfc0;font-size:13px;"><strong style="color:#c9a44c;">${t}:</strong> ${arr.join(' · ')}</p>` : '';
  return `
  <div style="background:#0c0a0d;padding:40px 0;font-family:Georgia,serif;">
    <div style="max-width:560px;margin:0 auto;background:#15121a;border-radius:16px;overflow:hidden;border:1px solid #2a2430;">
      <div style="padding:32px;text-align:center;border-bottom:1px solid #2a2430;">
        <p style="letter-spacing:.3em;color:#8a7f88;font-size:11px;text-transform:uppercase;margin:0;">Perfume Lab Chile</p>
        <h1 style="color:#f4eee9;font-size:26px;margin:16px 0 4px;">${d.nombreFragancia}</h1>
        <p style="color:#c9a44c;font-size:13px;margin:0;">${d.familia} · ${d.formatoLabel}</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#f4eee9;font-size:15px;">Hola ${d.clienteNombre},</p>
        <p style="color:#cabfc0;font-size:14px;line-height:1.6;">
          Tu fragancia ya está en producción. La preparamos a mano, sólo para ti.
          Pronto recibirás un objeto único con tu nombre y tu historia.
        </p>
        <div style="background:#0c0a0d;border-radius:12px;padding:20px;margin:24px 0;">
          ${notasLinea('Cabeza', d.notas.cabeza)}
          ${notasLinea('Corazón', d.notas.corazon)}
          ${notasLinea('Fondo', d.notas.fondo)}
        </div>
        ${d.packaging.length ? `<p style="color:#cabfc0;font-size:13px;">Packaging: ${d.packaging.join(', ')}</p>` : ''}
        <table style="width:100%;margin-top:16px;border-top:1px solid #2a2430;padding-top:16px;">
          <tr>
            <td style="color:#8a7f88;font-size:13px;">Pedido</td>
            <td style="color:#f4eee9;font-size:13px;text-align:right;">${d.numero}</td>
          </tr>
          <tr>
            <td style="color:#8a7f88;font-size:13px;padding-top:6px;">Total</td>
            <td style="color:#c9a44c;font-size:16px;text-align:right;padding-top:6px;">${formatCLP(d.montoTotal)}</td>
          </tr>
        </table>
      </div>
      <div style="padding:20px 32px;border-top:1px solid #2a2430;text-align:center;">
        <p style="color:#8a7f88;font-size:11px;margin:0;">perfumelabchile.cl</p>
      </div>
    </div>
  </div>`;
}

export async function enviarConfirmacionPedido(
  d: ConfirmacionPedidoData
): Promise<boolean> {
  const c = client();
  if (!c) {
    console.warn(
      `[email] RESEND_API_KEY no configurada — se omite confirmación de ${d.numero}`
    );
    return false;
  }
  try {
    await c.emails.send({
      from: env.email.from,
      to: d.clienteEmail,
      subject: `Tu fragancia "${d.nombreFragancia}" está en camino — ${d.numero}`,
      html: html(d),
    });
    return true;
  } catch (e) {
    console.error('[email] error enviando confirmación', e);
    return false;
  }
}
