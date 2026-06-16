import type { FamiliaKey, FamiliaSensorial } from '@/types';

/**
 * Sinestesia: cada familia olfativa traducida a color, movimiento y sonido.
 * El olfato no viaja por la pantalla; lo evocamos con luz, ritmo y timbre.
 */
export const FAMILIAS: Record<FamiliaKey, FamiliaSensorial> = {
  CITRICOS: {
    key: 'CITRICOS',
    nombre: 'Cítricos',
    color: '#e9d23b',
    colorSoft: '#f6ef9a',
    colorDeep: '#9bbf2e',
    mood: 'Cáscara recién rota y sol en la cara. Despierta.',
    motion: { velocidad: 1.7, particulas: 70, blur: 0 },
    sonido: { base: 392, onda: 'triangle', armonicos: [1, 2, 3, 4.2], textura: 'agudo' },
  },
  FLORALES: {
    key: 'FLORALES',
    nombre: 'Florales',
    color: '#e7a6c4',
    colorSoft: '#f7d6e6',
    colorDeep: '#b76a91',
    mood: 'Pétalos en aire tibio. Cercano, suave, vivo.',
    motion: { velocidad: 0.8, particulas: 55, blur: 1 },
    sonido: { base: 330, onda: 'sine', armonicos: [1, 2, 2.5, 3], textura: 'aireado' },
  },
  AMADERADOS: {
    key: 'AMADERADOS',
    nombre: 'Amaderados',
    color: '#8a5a2b',
    colorSoft: '#c69366',
    colorDeep: '#4a3018',
    mood: 'Madera tibia y resina. Calma con raíces.',
    motion: { velocidad: 0.45, particulas: 38, blur: 2 },
    sonido: { base: 110, onda: 'sawtooth', armonicos: [1, 2, 3], textura: 'calido' },
  },
  ORIENTALES: {
    key: 'ORIENTALES',
    nombre: 'Orientales',
    color: '#7d4fb0',
    colorSoft: '#caa9e8',
    colorDeep: '#3c2160',
    mood: 'Penumbra dorada, ámbar y especia. Íntimo, de noche.',
    motion: { velocidad: 0.55, particulas: 44, blur: 3 },
    sonido: { base: 146.83, onda: 'sine', armonicos: [1, 1.5, 2, 2.66], textura: 'envolvente' },
  },
  ACUATICOS: {
    key: 'ACUATICOS',
    nombre: 'Frescos / Acuáticos',
    color: '#3ba0d8',
    colorSoft: '#a9dcf2',
    colorDeep: '#1c5e85',
    mood: 'Brisa salada y aire abierto. Limpio, libre.',
    motion: { velocidad: 1.1, particulas: 60, blur: 1 },
    sonido: { base: 261.63, onda: 'sine', armonicos: [1, 2, 3.5], textura: 'agua' },
  },
  VERDES: {
    key: 'VERDES',
    nombre: 'Verdes',
    color: '#5fae6e',
    colorSoft: '#aedeb8',
    colorDeep: '#2f6b3c',
    mood: 'Tallo partido y hierba mojada. Fresco, con tierra.',
    motion: { velocidad: 0.95, particulas: 52, blur: 1 },
    sonido: { base: 196, onda: 'triangle', armonicos: [1, 2, 2.8], textura: 'aireado' },
  },
};

export const FAMILIA_LIST = Object.values(FAMILIAS);

export function familia(key: FamiliaKey): FamiliaSensorial {
  return FAMILIAS[key];
}

/** Etiqueta legible de la intensidad. */
export const INTENSIDAD_LABEL: Record<string, string> = {
  EDT: 'Eau de Toilette',
  EDP: 'Eau de Parfum',
  PARFUM: 'Extrait de Parfum',
};
