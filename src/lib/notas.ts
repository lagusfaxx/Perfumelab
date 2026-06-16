/**
 * Léxico sensorial de notas: traduce cada ingrediente en algo que se puede
 * "sentir con la vista". Tono cercano y concreto, nada de clichés de aviso.
 */

const LEX: Record<string, string> = {
  // Cítricos
  bergamota: 'cáscara verde recién rota',
  'limón de sicilia': 'corte ácido que despierta',
  limón: 'corte ácido que despierta',
  pomelo: 'amargor jugoso y eléctrico',
  'naranja sanguina': 'jugo rojo, sol de tarde',
  naranja: 'jugo dulce, piel al sol',
  mandarina: 'dulzor blando y soleado',
  petitgrain: 'hoja amarga del naranjo',
  // Aromáticos / especias
  neroli: 'azahar con miel y verde',
  'flor de azahar': 'flor blanca tibia, casi dulce',
  azahar: 'flor blanca tibia, casi dulce',
  jengibre: 'picor fresco que hormiguea',
  'pimienta rosa': 'chispa rosada y punzante',
  'pimienta negra': 'calor seco que raspa',
  pimienta: 'calor seco que raspa',
  cardamomo: 'especia fresca, aire de souk',
  azafrán: 'cuero dorado, especia cara',
  salvia: 'hierba seca al sol',
  // Frutas
  pera: 'mordida jugosa y fría',
  grosella: 'rojo ácido con hoja verde',
  frambuesa: 'mermelada con filo',
  // Flores
  'rosa damascena': 'pétalo con miel y pimienta',
  rosa: 'pétalo aterciopelado',
  'jazmín sambac': 'flor narcótica, blanca y carnal',
  'jazmín acuático': 'jazmín lavado en agua fría',
  jazmín: 'flor blanca, intensa y carnal',
  peonía: 'flor de agua, rosada y leve',
  violeta: 'polvo dulce, nostalgia',
  iris: 'raíz fría, terrosa y elegante',
  // Maderas / tierra
  'sándalo de mysore': 'leche de madera, cremoso',
  sándalo: 'leche de madera, cremoso',
  'cedro del atlas': 'lápiz recién afilado',
  'cedro claro': 'madera rubia y seca',
  cedro: 'madera seca de lápiz',
  ciprés: 'bosque verde y resinoso',
  vetiver: 'raíz húmeda, tierra y humo',
  pachulí: 'tierra oscura, cacao y cuero',
  'musgo de roble': 'suelo de bosque mojado',
  musgo: 'suelo de bosque mojado',
  'maderas oscuras': 'fondo cálido y ahumado',
  'maderas claras': 'madera rubia y limpia',
  maderas: 'fondo seco y cálido',
  // Orientales / resinas
  'ámbar gris': 'sal mineral, piel y mar',
  ámbar: 'resina tibia que abraza',
  'vainilla de madagascar': 'postre tibio que reconforta',
  'vainilla suave': 'leche dulce y tibia',
  vainilla: 'postre tibio que reconforta',
  incienso: 'humo de templo, frío y solemne',
  mirra: 'bálsamo amargo, resina vieja',
  benjuí: 'caramelo de iglesia',
  oud: 'madera densa y animal',
  elemí: 'resina con corteza de limón',
  // Almizcles
  'almizcle blanco': 'piel limpia recién lavada',
  almizcle: 'abrazo invisible en la piel',
  // Verdes / acuáticos
  galbanum: 'savia verde cortante',
  'hoja de higuera': 'hoja lechosa, fruta verde',
  higuera: 'hoja lechosa, fruta verde',
  'té verde': 'vapor amargo y sereno',
  'notas marinas': 'espuma fría y salada',
  'acordes salinos': 'sal, ozono, piel mojada',
};

/** Quita acentos y baja a minúsculas. */
function plano(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

// Mapa normalizado (sin acentos) + claves ordenadas de más larga a más corta.
const LEX_PLANO: Record<string, string> = {};
for (const [k, v] of Object.entries(LEX)) LEX_PLANO[plano(k)] = v;
const KEYS_PLANO = Object.keys(LEX_PLANO).sort((a, b) => b.length - a.length);

/** Descriptor sensorial corto de una nota (cadena vacía si no se reconoce). */
export function sentirNota(nota: string): string {
  const n = plano(nota);
  if (LEX_PLANO[n]) return LEX_PLANO[n];
  for (const k of KEYS_PLANO) {
    if (n.includes(k) || k.includes(n)) return LEX_PLANO[k];
  }
  return '';
}
