import { createHmac } from 'node:crypto';
import { env } from './env';

/**
 * Cliente de la pasarela FLOW (flow.cl).
 *
 * FIRMA (el error más común): se toman TODOS los parámetros excepto `s`,
 * se ordenan alfabéticamente por nombre, se concatenan como `nombre+valor`
 * (sin separadores) y se firma con HMAC-SHA256 usando el secretKey → hex.
 *
 * El webhook `urlConfirmation` es la FUENTE DE VERDAD del pago, no `urlReturn`.
 */

export type FlowParams = Record<string, string | number>;

/** Estados de pago de FLOW. */
export const FLOW_STATUS = {
  PENDIENTE: 1,
  PAGADO: 2,
  RECHAZADO: 3,
  ANULADO: 4,
} as const;

/**
 * Firma HMAC-SHA256 sobre los parámetros ordenados alfabéticamente.
 * Importante: se firman los valores crudos (sin URL-encode).
 */
export function firmar(params: FlowParams, secretKey: string): string {
  const keys = Object.keys(params).sort();
  let toSign = '';
  for (const k of keys) {
    toSign += k + String(params[k]);
  }
  return createHmac('sha256', secretKey).update(toSign).digest('hex');
}

/** Construye el body/query URL-encoded incluyendo la firma `s`. */
function packed(params: FlowParams): URLSearchParams {
  const secret = env.flow.secretKey;
  const s = firmar(params, secret);
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) usp.append(k, String(v));
  usp.append('s', s);
  return usp;
}

export interface FlowCreateInput {
  commerceOrder: string; // nuestro número de pedido (único)
  subject: string;
  amount: number; // CLP entero
  email: string;
  urlConfirmation: string; // webhook server-to-server
  urlReturn: string; // retorno del navegador
  optional?: Record<string, string>;
}

export interface FlowCreateResponse {
  url: string; // base de pago de FLOW
  token: string;
  flowOrder: number;
  /** URL final a la que redirigir al usuario. */
  redirectUrl: string;
}

/** Crea un pago en FLOW (payment/create) y devuelve la URL de redirección. */
export async function crearPago(
  input: FlowCreateInput
): Promise<FlowCreateResponse> {
  const params: FlowParams = {
    apiKey: env.flow.apiKey,
    commerceOrder: input.commerceOrder,
    subject: input.subject,
    currency: 'CLP',
    amount: Math.round(input.amount),
    email: input.email,
    urlConfirmation: input.urlConfirmation,
    urlReturn: input.urlReturn,
  };
  if (input.optional && Object.keys(input.optional).length > 0) {
    params.optional = JSON.stringify(input.optional);
  }

  const body = packed(params);
  const res = await fetch(`${env.flow.baseUrl}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `FLOW payment/create falló (${res.status}): ${JSON.stringify(data)}`
    );
  }
  return {
    url: data.url,
    token: data.token,
    flowOrder: data.flowOrder,
    redirectUrl: `${data.url}?token=${data.token}`,
  };
}

export interface FlowStatusResponse {
  flowOrder: number;
  commerceOrder: string;
  requestDate: string;
  status: number; // 1..4
  subject: string;
  currency: string;
  amount: number;
  payer: string;
  optional?: string;
  paymentData?: Record<string, unknown>;
  [k: string]: unknown;
}

/** Consulta el estado de un pago (payment/getStatus). FUENTE DE VERDAD. */
export async function obtenerEstado(token: string): Promise<FlowStatusResponse> {
  const params: FlowParams = { apiKey: env.flow.apiKey, token };
  const query = packed(params);
  const res = await fetch(`${env.flow.baseUrl}/payment/getStatus?${query.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `FLOW payment/getStatus falló (${res.status}): ${JSON.stringify(data)}`
    );
  }
  return data as FlowStatusResponse;
}
