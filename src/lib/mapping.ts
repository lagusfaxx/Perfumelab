import type {
  FamiliaKey,
  IntensidadKey,
  MatchResult,
  PreferenceVector,
} from '@/types';
import { FAMILIA_KEYS } from '@/types';
import { RITUAL_STEPS } from './ritual-config';

// Escalas de normalización para los ejes transversales (sumas → 0..1).
const AXIS_SCALE = { intensidad: 2.2, calidez: 2.0, dulzor: 1.8 } as const;

export function emptyVector(): PreferenceVector {
  return {
    CITRICOS: 0,
    FLORALES: 0,
    AMADERADOS: 0,
    ORIENTALES: 0,
    ACUATICOS: 0,
    VERDES: 0,
    intensidad: 0,
    calidez: 0,
    dulzor: 0,
  };
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Acumula las respuestas del ritual en un vector crudo (sin normalizar).
 * respuestas: { [stepId]: optionId }
 */
export function acumular(respuestas: Record<string, string>): PreferenceVector {
  const acc = emptyVector();
  for (const step of RITUAL_STEPS) {
    const elegido = respuestas[step.id];
    if (!elegido) continue;
    const opt = step.options.find((o) => o.id === elegido);
    if (!opt) continue;
    for (const [k, v] of Object.entries(opt.weights)) {
      acc[k as keyof PreferenceVector] += v as number;
    }
  }
  return acc;
}

/**
 * Normaliza el acumulado:
 * - Familias → afinidad relativa 0..1 (la más fuerte = 1).
 * - Ejes → 0..1 por escala fija + clamp.
 */
export function normalizar(acc: PreferenceVector): PreferenceVector {
  const out = emptyVector();

  let maxFam = 0;
  for (const k of FAMILIA_KEYS) maxFam = Math.max(maxFam, Math.max(0, acc[k]));
  for (const k of FAMILIA_KEYS) {
    out[k] = maxFam > 0 ? clamp01(Math.max(0, acc[k]) / maxFam) : 0;
  }

  out.intensidad = clamp01(acc.intensidad / AXIS_SCALE.intensidad);
  out.calidez = clamp01(acc.calidez / AXIS_SCALE.calidez);
  out.dulzor = clamp01(acc.dulzor / AXIS_SCALE.dulzor);
  return out;
}

/** Respuestas → vector de preferencias listo para scoring. */
export function respuestasToVector(
  respuestas: Record<string, string>
): PreferenceVector {
  return normalizar(acumular(respuestas));
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Similitud usuario ↔ combinación (0..1).
 *  - 60% forma del perfil de familias (coseno).
 *  - 30% cercanía en ejes (intensidad/calidez/dulzor).
 *  - 10% match exacto de intensidad.
 */
export function score(
  user: PreferenceVector,
  comb: PreferenceVector
): number {
  const famA = FAMILIA_KEYS.map((k) => user[k]);
  const famB = FAMILIA_KEYS.map((k) => comb[k]);
  const famSim = cosine(famA, famB);

  const ejes: (keyof PreferenceVector)[] = ['intensidad', 'calidez', 'dulzor'];
  let dist = 0;
  for (const e of ejes) dist += Math.abs(user[e] - comb[e]);
  const ejeSim = 1 - dist / ejes.length;

  const intensidadBonus = 1 - Math.abs(user.intensidad - comb.intensidad);

  return clamp01(0.6 * famSim + 0.3 * ejeSim + 0.1 * intensidadBonus);
}

export interface Scoreable {
  id: string;
  sku: string;
  vector: PreferenceVector;
}

/**
 * Ordena las combinaciones por afinidad. Devuelve el mejor match
 * y 1–2 alternativas (distintas en familia/intensidad cuando es posible).
 */
export function rankear(
  user: PreferenceVector,
  combinaciones: Scoreable[]
): MatchResult[] {
  const scored = combinaciones
    .map((c) => ({ combinacionId: c.id, sku: c.sku, score: score(user, c.vector) }))
    .sort((a, b) => b.score - a.score);
  return scored;
}

/** Conveniencia: vector de intensidad por enum (para construir vectores de combinación). */
export const INTENSIDAD_VALUE: Record<IntensidadKey, number> = {
  EDT: 0.3,
  EDP: 0.6,
  PARFUM: 0.9,
};

/** Familia dominante de un vector. */
export function familiaDominante(v: PreferenceVector): FamiliaKey {
  let best: FamiliaKey = 'FLORALES';
  let max = -Infinity;
  for (const k of FAMILIA_KEYS) {
    if (v[k] > max) {
      max = v[k];
      best = k;
    }
  }
  return best;
}
