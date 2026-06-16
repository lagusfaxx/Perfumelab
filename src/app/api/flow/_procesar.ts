import { prisma } from '@/lib/prisma';
import { FAMILIAS } from '@/lib/families';
import { obtenerEstado, type FlowStatusResponse } from '@/lib/flow';
import { enviarConfirmacionPedido, type ConfirmacionPedidoData } from '@/lib/email';
import type { FamiliaKey } from '@/types';
import { Prisma } from '@prisma/client';

/**
 * Lógica compartida por el webhook `/confirm` (fuente de verdad) y el
 * mejor-esfuerzo de `/return`. Idempotente: segura ante reintentos de FLOW.
 */

// Estados terminales: una vez aquí, no se re-disparan efectos.
const TERMINALES = new Set([
  'PAGADO',
  'RECHAZADO',
  'EN_PREPARACION',
  'ENVIADO',
  'ENTREGADO',
  'CANCELADO',
]);

/**
 * Consulta el estado en FLOW por token y actualiza el Pedido de forma idempotente.
 * Sólo en la transición PENDIENTE → PAGADO (y si no se ha enviado) manda el email.
 * Nunca lanza: registra y retorna.
 */
export async function procesarToken(token: string): Promise<void> {
  let data: FlowStatusResponse;
  try {
    data = await obtenerEstado(token);
  } catch (err) {
    console.error('[flow] obtenerEstado falló', err);
    return;
  }

  // Buscar pedido por token; fallback por commerceOrder === numero.
  let pedido = await prisma.pedido.findUnique({ where: { flowToken: token } });
  if (!pedido && data.commerceOrder) {
    pedido = await prisma.pedido.findUnique({
      where: { numero: data.commerceOrder },
    });
  }

  // Sin pedido → idempotente, no hay nada que hacer.
  if (!pedido) {
    console.warn('[flow] pedido no encontrado para token/commerceOrder', {
      token,
      commerceOrder: data.commerceOrder,
    });
    return;
  }

  const status = data.status;

  // Auditoría de monto: si difiere, advertir pero procesar por el estado de FLOW.
  if (typeof data.amount === 'number' && Math.round(data.amount) !== pedido.montoTotal) {
    console.warn('[flow] monto FLOW difiere del pedido', {
      numero: pedido.numero,
      flowAmount: Math.round(data.amount),
      montoTotal: pedido.montoTotal,
    });
  }

  const seraPagado = status === 2;
  const esTransicionAPagado = pedido.estado === 'PENDIENTE' && seraPagado;

  // Idempotencia: si ya es terminal y esto no aporta la transición PENDIENTE→PAGADO,
  // no hay efectos secundarios.
  if (TERMINALES.has(pedido.estado) && !esTransicionAPagado) {
    return;
  }

  // Construir el update según el estado de FLOW.
  const update: Prisma.PedidoUpdateInput = {
    flowStatus: status,
  };
  const jsonValue = data as unknown as Prisma.InputJsonValue;

  if (status === 2) {
    update.estado = 'PAGADO';
    update.paidAt = new Date();
    update.flowPaymentJson = jsonValue;
  } else if (status === 3 || status === 4) {
    update.estado = 'RECHAZADO';
    update.flowPaymentJson = jsonValue;
  } else {
    // status === 1 (u otro): se mantiene PENDIENTE.
    update.estado = 'PENDIENTE';
  }

  try {
    await prisma.pedido.update({ where: { id: pedido.id }, data: update });
  } catch (err) {
    console.error('[flow] error actualizando pedido', err);
    return;
  }

  // Email SÓLO en la transición PENDIENTE → PAGADO y si no se ha enviado.
  if (esTransicionAPagado && pedido.emailEnviado === false) {
    await enviarEmailConfirmacion(pedido.id);
  }
}

/** Carga relaciones y manda el correo de confirmación. Marca emailEnviado si éxito. */
async function enviarEmailConfirmacion(pedidoId: string): Promise<void> {
  try {
    const full = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        perfil: { include: { combinacion: { include: { base: true } } } },
        packaging: true,
      },
    });
    if (!full) return;

    const base = full.perfil.combinacion.base;
    const familiaKey = base.familiaOlfativa as FamiliaKey;

    const payload: ConfirmacionPedidoData = {
      numero: full.numero,
      clienteNombre: full.clienteNombre,
      clienteEmail: full.clienteEmail,
      nombreFragancia: full.nombreFraganciaCliente,
      formatoLabel: full.formatoLabel,
      familia: FAMILIAS[familiaKey].nombre,
      notas: {
        cabeza: base.notasCabeza,
        corazon: base.notasCorazon,
        fondo: base.notasFondo,
      },
      montoTotal: full.montoTotal,
      packaging: full.packaging.map((p) => p.nombre),
    };

    const ok = await enviarConfirmacionPedido(payload);
    if (ok) {
      await prisma.pedido.update({
        where: { id: full.id },
        data: { emailEnviado: true },
      });
    }
  } catch (err) {
    // Nunca propagar: el email no debe romper el webhook.
    console.error('[flow] error enviando email de confirmación', err);
  }
}
