import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge de clases Tailwind sin colisiones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea CLP: 29990 → "$29.990". */
export function formatCLP(monto: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(monto);
}

export function formatFecha(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

/** Valida RUT chileno (módulo 11). */
export function validarRut(rut: string): boolean {
  const clean = rut.replace(/[.\-\s]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(cuerpo)) return false;
  let suma = 0;
  let mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const resto = 11 - (suma % 11);
  const dvCalc = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvCalc;
}

/** Formatea RUT: 123456789 → "12.345.678-9". */
export function formatRut(rut: string): string {
  const clean = rut.replace(/[.\-\s]/g, '').toUpperCase();
  if (clean.length < 2) return rut;
  const cuerpo = clean.slice(0, -1);
  const dv = clean.slice(-1);
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Número de pedido legible: PL-2026-XXXXXX */
export function generarNumeroPedido(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, '0');
  return `PL-${year}-${rand}`;
}
