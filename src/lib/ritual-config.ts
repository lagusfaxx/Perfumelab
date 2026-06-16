import type { FamiliaKey, PreferenceVector, RitualStep } from '@/types';
import { FAMILIA_KEYS } from '@/types';

/**
 * El cuestionario-ritual. NO es un formulario: es un viaje de autoconocimiento.
 * Cada opción devuelve un fragmento de identidad y empuja el vector de preferencias.
 */

/** Familia dominante del acumulado (para los "reflejos"). */
function dominante(acc: PreferenceVector): FamiliaKey {
  let best: FamiliaKey = 'FLORALES';
  let max = -Infinity;
  for (const k of FAMILIA_KEYS) {
    if (acc[k] > max) {
      max = acc[k];
      best = k;
    }
  }
  return best;
}

const NOMBRE_FAMILIA: Record<FamiliaKey, string> = {
  CITRICOS: 'lo luminoso y chispeante',
  FLORALES: 'lo delicado y floral',
  AMADERADOS: 'lo cálido y amaderado',
  ORIENTALES: 'lo íntimo y envolvente',
  ACUATICOS: 'lo fresco y abierto',
  VERDES: 'lo verde y terroso',
};

export const RITUAL_STEPS: RitualStep[] = [
  {
    id: 'momento',
    pregunta: '¿Qué momento del día te representa?',
    subtitulo: 'No el que vives. El que eres.',
    options: [
      {
        id: 'amanecer',
        label: 'El primer rayo',
        hint: 'cuando el aire todavía está limpio',
        familiaAcento: 'CITRICOS',
        weights: { CITRICOS: 0.9, ACUATICOS: 0.3, calidez: 0.2, intensidad: 0.3 },
      },
      {
        id: 'mediodia',
        label: 'Pleno mediodía',
        hint: 'luz alta, viento de mar',
        familiaAcento: 'ACUATICOS',
        weights: { ACUATICOS: 0.8, CITRICOS: 0.3, calidez: 0.1, intensidad: 0.35 },
      },
      {
        id: 'atardecer',
        label: 'El oro del atardecer',
        hint: 'cuando todo se vuelve tibio',
        familiaAcento: 'FLORALES',
        weights: { FLORALES: 0.7, AMADERADOS: 0.4, calidez: 0.6, dulzor: 0.4 },
      },
      {
        id: 'medianoche',
        label: 'La medianoche',
        hint: 'penumbra, secreto, brasa',
        familiaAcento: 'ORIENTALES',
        weights: { ORIENTALES: 0.9, AMADERADOS: 0.4, calidez: 0.8, intensidad: 0.7, dulzor: 0.5 },
      },
    ],
    reflejo: (acc) =>
      `Tu perfil empieza a inclinarse hacia ${NOMBRE_FAMILIA[dominante(acc)]}…`,
  },
  {
    id: 'textura',
    pregunta: 'Elige una textura para tocar con los ojos cerrados.',
    options: [
      {
        id: 'seda',
        label: 'Seda fría',
        familiaAcento: 'FLORALES',
        weights: { FLORALES: 0.8, calidez: 0.2, intensidad: 0.2 },
      },
      {
        id: 'madera',
        label: 'Madera pulida',
        familiaAcento: 'AMADERADOS',
        weights: { AMADERADOS: 0.9, calidez: 0.6, intensidad: 0.5 },
      },
      {
        id: 'agua',
        label: 'Agua entre los dedos',
        familiaAcento: 'ACUATICOS',
        weights: { ACUATICOS: 0.9, intensidad: 0.2 },
      },
      {
        id: 'terciopelo',
        label: 'Terciopelo oscuro',
        familiaAcento: 'ORIENTALES',
        weights: { ORIENTALES: 0.8, calidez: 0.7, dulzor: 0.5, intensidad: 0.6 },
      },
      {
        id: 'hoja',
        label: 'Hoja recién partida',
        familiaAcento: 'VERDES',
        weights: { VERDES: 0.9, ACUATICOS: 0.2, intensidad: 0.3 },
      },
    ],
  },
  {
    id: 'lugar',
    pregunta: 'Un lugar al que tu memoria vuelve sola.',
    subtitulo: 'Respíralo de nuevo.',
    options: [
      {
        id: 'bosque',
        label: 'Bosque después de la lluvia',
        familiaAcento: 'VERDES',
        weights: { VERDES: 0.7, AMADERADOS: 0.6, calidez: 0.3, intensidad: 0.4 },
      },
      {
        id: 'costa',
        label: 'Una costa al atardecer',
        familiaAcento: 'ACUATICOS',
        weights: { ACUATICOS: 0.8, CITRICOS: 0.2, calidez: 0.2 },
      },
      {
        id: 'jardin',
        label: 'Un jardín en plena flor',
        familiaAcento: 'FLORALES',
        weights: { FLORALES: 0.9, dulzor: 0.4, calidez: 0.3 },
      },
      {
        id: 'mercado',
        label: 'Un mercado de especias',
        familiaAcento: 'ORIENTALES',
        weights: { ORIENTALES: 0.8, AMADERADOS: 0.3, calidez: 0.7, dulzor: 0.4, intensidad: 0.6 },
      },
      {
        id: 'huerto',
        label: 'Un huerto de cítricos al sol',
        familiaAcento: 'CITRICOS',
        weights: { CITRICOS: 0.9, VERDES: 0.3, intensidad: 0.3 },
      },
    ],
    reflejo: (acc) =>
      acc.calidez > 0.5
        ? 'Hay calor en lo que eliges. Algo envolvente te llama.'
        : 'Buscas claridad, aire, algo que respire contigo.',
  },
  {
    id: 'intensidad',
    pregunta: '¿Cómo quieres que te recuerden?',
    subtitulo: 'La huella que dejas al salir de una habitación.',
    options: [
      {
        id: 'susurro',
        label: 'Un susurro en la piel',
        hint: 'sólo quien se acerca lo descubre',
        weights: { intensidad: 0.1 },
      },
      {
        id: 'presencia',
        label: 'Una presencia serena',
        hint: 'te acompaña sin gritar',
        weights: { intensidad: 0.55 },
      },
      {
        id: 'estela',
        label: 'Una estela que permanece',
        hint: 'el aire recuerda que pasaste',
        weights: { intensidad: 1.0, dulzor: 0.2, calidez: 0.2 },
      },
    ],
  },
  {
    id: 'ocasion',
    pregunta: '¿Para qué versión de ti es este perfume?',
    options: [
      {
        id: 'diaria',
        label: 'La de todos los días',
        weights: { CITRICOS: 0.3, ACUATICOS: 0.4, VERDES: 0.2, intensidad: 0.2 },
      },
      {
        id: 'trabajo',
        label: 'La que entra a una sala y la ordena',
        weights: { AMADERADOS: 0.4, VERDES: 0.3, ACUATICOS: 0.2, intensidad: 0.45 },
      },
      {
        id: 'noche',
        label: 'La de las noches que importan',
        weights: { ORIENTALES: 0.6, FLORALES: 0.3, calidez: 0.5, intensidad: 0.7, dulzor: 0.4 },
      },
      {
        id: 'intima',
        label: 'La que sólo conoce quien te abraza',
        weights: { ORIENTALES: 0.5, AMADERADOS: 0.4, calidez: 0.7, dulzor: 0.5, intensidad: 0.5 },
      },
    ],
  },
  {
    id: 'amor',
    pregunta: 'Una nota que amas sin razón.',
    options: [
      {
        id: 'citrico',
        label: 'Ralladura de naranja y bergamota',
        familiaAcento: 'CITRICOS',
        weights: { CITRICOS: 1.0 },
      },
      {
        id: 'flor',
        label: 'Jazmín, rosa, flor de azahar',
        familiaAcento: 'FLORALES',
        weights: { FLORALES: 1.0, dulzor: 0.3 },
      },
      {
        id: 'madera',
        label: 'Sándalo, cedro, vetiver',
        familiaAcento: 'AMADERADOS',
        weights: { AMADERADOS: 1.0, calidez: 0.4 },
      },
      {
        id: 'ambar',
        label: 'Ámbar, vainilla, incienso',
        familiaAcento: 'ORIENTALES',
        weights: { ORIENTALES: 1.0, dulzor: 0.5, calidez: 0.6 },
      },
      {
        id: 'salino',
        label: 'Sal, ozono, brisa',
        familiaAcento: 'ACUATICOS',
        weights: { ACUATICOS: 1.0 },
      },
      {
        id: 'verde',
        label: 'Higuera, té verde, galbanum',
        familiaAcento: 'VERDES',
        weights: { VERDES: 1.0 },
      },
    ],
  },
  {
    id: 'rechazo',
    pregunta: '¿Y algo que nunca llevarías?',
    subtitulo: 'Saber lo que no eres también te define.',
    options: [
      {
        id: 'no-dulce',
        label: 'Lo demasiado dulce',
        weights: { dulzor: -0.6, ORIENTALES: -0.3 },
      },
      {
        id: 'no-intenso',
        label: 'Lo que se siente a metros',
        weights: { intensidad: -0.5, ORIENTALES: -0.2 },
      },
      {
        id: 'no-floral',
        label: 'Lo excesivamente floral',
        weights: { FLORALES: -0.6 },
      },
      {
        id: 'no-amaderado',
        label: 'Lo seco y amaderado',
        weights: { AMADERADOS: -0.5, VERDES: -0.2, dulzor: 0.2 },
      },
      {
        id: 'nada',
        label: 'Estoy abierta a todo',
        hint: 'la curiosidad también es una nota',
        weights: {},
      },
    ],
    reflejo: () => 'Ya casi puedo nombrar tu fragancia. Respira hondo.',
  },
];

export const RITUAL_TOTAL_STEPS = RITUAL_STEPS.length;
