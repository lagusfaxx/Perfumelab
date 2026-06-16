// Tipos de dominio compartidos entre cliente, servidor y motor de mapeo.

export type FamiliaKey =
  | 'CITRICOS'
  | 'FLORALES'
  | 'AMADERADOS'
  | 'ORIENTALES'
  | 'ACUATICOS'
  | 'VERDES';

export type IntensidadKey = 'EDT' | 'EDP' | 'PARFUM';

/**
 * Vector de preferencias olfativas.
 * - Afinidad por cada familia (0..1).
 * - Ejes transversales de mood (0..1).
 * Tanto las respuestas del usuario como las combinaciones se proyectan aquí.
 */
export interface PreferenceVector {
  CITRICOS: number;
  FLORALES: number;
  AMADERADOS: number;
  ORIENTALES: number;
  ACUATICOS: number;
  VERDES: number;
  /** 0 = sutil / piel · 1 = potente / estela */
  intensidad: number;
  /** 0 = frío / fresco · 1 = cálido / envolvente */
  calidez: number;
  /** 0 = seco / mineral · 1 = dulce / goloso */
  dulzor: number;
}

export const VECTOR_KEYS: (keyof PreferenceVector)[] = [
  'CITRICOS',
  'FLORALES',
  'AMADERADOS',
  'ORIENTALES',
  'ACUATICOS',
  'VERDES',
  'intensidad',
  'calidez',
  'dulzor',
];

export const FAMILIA_KEYS: FamiliaKey[] = [
  'CITRICOS',
  'FLORALES',
  'AMADERADOS',
  'ORIENTALES',
  'ACUATICOS',
  'VERDES',
];

/** Una opción de una pregunta del ritual. */
export interface RitualOption {
  id: string;
  label: string;
  /** Texto poético corto que aparece al pasar/elegir. */
  hint?: string;
  /**
   * A qué huele esta elección: frase sensorial concreta que se "respira"
   * al pasar o elegir la opción (ej. "Tierra mojada, musgo y madera").
   */
  aroma?: string;
  /** Aporte parcial al vector de preferencias (se acumula). */
  weights: Partial<PreferenceVector>;
  /** Familia que esta opción "enciende" visualmente al elegirse. */
  familiaAcento?: FamiliaKey;
}

/** Un paso del cuestionario-ritual. */
export interface RitualStep {
  id: string;
  /** Pregunta principal. */
  pregunta: string;
  /** Subtítulo / instrucción sutil. */
  subtitulo?: string;
  options: RitualOption[];
  /** "Reflejo" mostrado tras responder (función del acumulado). */
  reflejo?: (acc: PreferenceVector) => string | null;
}

/** Resultado del scoring contra una combinación. */
export interface MatchResult {
  combinacionId: string;
  sku: string;
  score: number; // 0..1
}

/** Lenguaje sensorial de una familia olfativa (sinestesia). */
export interface FamiliaSensorial {
  key: FamiliaKey;
  nombre: string;
  /** Tailwind/CSS hex. */
  color: string;
  colorSoft: string;
  colorDeep: string;
  /** Descripción del mood. */
  mood: string;
  /** Parámetros de movimiento para Framer Motion / partículas. */
  motion: {
    velocidad: number; // multiplicador de velocidad de partículas
    particulas: number; // densidad
    blur: number; // px
  };
  /** Descriptor del soundscape (mapeado a osciladores en el SoundEngine). */
  sonido: {
    /** Frecuencia base del drone (Hz). */
    base: number;
    /** Tipo de onda dominante. */
    onda: OscillatorType;
    /** Notas/armónicos relativos a la base. */
    armonicos: number[];
    /** Textura: 'agudo' | 'calido' | 'aireado' | 'envolvente' | 'agua'. */
    textura: string;
  };
}
