import type { FamiliaKey, PreferenceVector } from '@/types';
import { familiaDominante } from './mapping';

/**
 * Generador de nombres evocadores para la fragancia revelada.
 * Ej. "Bruma de Medianoche", "Eco de Cedro", "Sal y Luz".
 * Determinista respecto del perfil + una semilla, para poder reproducirlo.
 */

const SUSTANTIVO: Record<FamiliaKey, string[]> = {
  CITRICOS: ['Destello', 'Alba', 'Chispa', 'Reflejo', 'Luz'],
  FLORALES: ['Pétalo', 'Bruma', 'Susurro', 'Velo', 'Seda'],
  AMADERADOS: ['Eco', 'Raíz', 'Brasa', 'Cedro', 'Vetiver'],
  ORIENTALES: ['Ámbar', 'Penumbra', 'Incienso', 'Brasa', 'Secreto'],
  ACUATICOS: ['Marea', 'Sal', 'Onda', 'Brisa', 'Rocío'],
  VERDES: ['Savia', 'Tallo', 'Higuera', 'Hoja', 'Lluvia'],
};

const COMPLEMENTO: Record<FamiliaKey, string[]> = {
  CITRICOS: ['de Mediodía', 'de Verano', 'Naciente', 'del Sur'],
  FLORALES: ['de Medianoche', 'de Jardín', 'Suspendido', 'en Flor'],
  AMADERADOS: ['de Bosque', 'de Otoño', 'Antiguo', 'de Tronco'],
  ORIENTALES: ['de Medianoche', 'de Oriente', 'Velado', 'de Ceniza'],
  ACUATICOS: ['de Costa', 'de Marzo', 'Salino', 'del Norte'],
  VERDES: ['tras la Lluvia', 'de Huerto', 'Húmedo', 'de Primavera'],
};

// Plantillas alternativas para variedad.
const PARES: [string, string][] = [
  ['Sal', 'Luz'],
  ['Humo', 'Miel'],
  ['Cedro', 'Lluvia'],
  ['Ámbar', 'Frío'],
  ['Flor', 'Ceniza'],
];

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const pick = <T,>(arr: T[], n: number): T => arr[n % arr.length];

export function generarNombre(
  vector: PreferenceVector,
  seed = String(Date.now())
): string {
  const fam = familiaDominante(vector);
  const h = hashSeed(seed + fam);

  // 1 de cada 4 usa la plantilla "A y B".
  if (h % 4 === 0) {
    const [a, b] = pick(PARES, h >> 2);
    return `${a} y ${b}`;
  }

  const sust = pick(SUSTANTIVO[fam], h);
  const comp = pick(COMPLEMENTO[fam], h >> 3);
  return `${sust} ${comp}`;
}

/** Tres sugerencias distintas para mostrar al usuario al renombrar. */
export function sugerencias(vector: PreferenceVector): string[] {
  const out = new Set<string>();
  let i = 0;
  while (out.size < 3 && i < 30) {
    out.add(generarNombre(vector, `s${i}`));
    i++;
  }
  return [...out];
}
