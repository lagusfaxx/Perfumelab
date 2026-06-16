import type { FamiliaKey, FamiliaSensorial } from '@/types';

/**
 * Sinestesia: cada familia olfativa traducida a color, movimiento y sonido.
 * El olfato no viaja por la pantalla; lo evocamos con luz, ritmo y timbre.
 */
export const FAMILIAS: Record<FamiliaKey, FamiliaSensorial> = {
  CITRICOS: {
    key: 'CITRICOS',
    nombre: 'Cítricos',
    color: '#cbb45a',
    colorSoft: '#e3d6a0',
    colorDeep: '#8a8a44',
    mood: 'Cáscara recién rota y sol en la cara. Despierta.',
    motion: { velocidad: 1.7, particulas: 70, blur: 0 },
    sonido: { base: 392, onda: 'triangle', armonicos: [1, 2, 3, 4.2], textura: 'agudo' },
  },
  FLORALES: {
    key: 'FLORALES',
    nombre: 'Florales',
    color: '#c98da6',
    colorSoft: '#e6c8d3',
    colorDeep: '#9c6678',
    mood: 'Pétalos en aire tibio. Cercano, suave, vivo.',
    motion: { velocidad: 0.8, particulas: 55, blur: 1 },
    sonido: { base: 330, onda: 'sine', armonicos: [1, 2, 2.5, 3], textura: 'aireado' },
  },
  AMADERADOS: {
    key: 'AMADERADOS',
    nombre: 'Amaderados',
    color: '#9c6f44',
    colorSoft: '#c39a72',
    colorDeep: '#5a4128',
    mood: 'Madera tibia y resina. Calma con raíces.',
    motion: { velocidad: 0.45, particulas: 38, blur: 2 },
    sonido: { base: 110, onda: 'sawtooth', armonicos: [1, 2, 3], textura: 'calido' },
  },
  ORIENTALES: {
    key: 'ORIENTALES',
    nombre: 'Orientales',
    color: '#8a6a86',
    colorSoft: '#b89bad',
    colorDeep: '#463442',
    mood: 'Penumbra dorada, ámbar y especia. Íntimo, de noche.',
    motion: { velocidad: 0.55, particulas: 44, blur: 3 },
    sonido: { base: 146.83, onda: 'sine', armonicos: [1, 1.5, 2, 2.66], textura: 'envolvente' },
  },
  ACUATICOS: {
    key: 'ACUATICOS',
    nombre: 'Frescos / Acuáticos',
    color: '#5d93a0',
    colorSoft: '#aac6cc',
    colorDeep: '#365e66',
    mood: 'Brisa salada y aire abierto. Limpio, libre.',
    motion: { velocidad: 1.1, particulas: 60, blur: 1 },
    sonido: { base: 261.63, onda: 'sine', armonicos: [1, 2, 3.5], textura: 'agua' },
  },
  VERDES: {
    key: 'VERDES',
    nombre: 'Verdes',
    color: '#7d9466',
    colorSoft: '#b9cca6',
    colorDeep: '#46613f',
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
