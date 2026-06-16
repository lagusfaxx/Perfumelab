import type { FamiliaKey } from '@/types';

/**
 * Formas serializables que el server page (`/checkout`) entrega al
 * componente cliente del checkout. Se aplanan respecto a Prisma para
 * pasar sólo lo necesario por el límite servidor → cliente.
 */

export interface FormatoView {
  id: string;
  nombre: string; // ej. "Eau de Parfum · 50 ml"
  ml: number;
  precio: number; // CLP
}

export interface PackagingView {
  id: string;
  nombre: string;
  descripcion: string | null;
  precioExtra: number; // CLP
}

export interface FraganciaView {
  perfilId: string;
  nombreFragancia: string;
  baseNombre: string;
  familia: FamiliaKey;
  familiaNombre: string;
  notasCabeza: string[];
  notasCorazon: string[];
  notasFondo: string[];
}
