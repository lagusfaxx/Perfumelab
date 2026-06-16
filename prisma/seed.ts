import { PrismaClient, type Intensidad } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { FamiliaKey, PreferenceVector } from '../src/types';
import { emptyVector, INTENSIDAD_VALUE } from '../src/lib/mapping';
import { INTENSIDAD_LABEL } from '../src/lib/families';

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────
const vec = (p: Partial<PreferenceVector>): PreferenceVector => ({
  ...emptyVector(),
  ...p,
});
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

// ── Bases (10 fórmulas madre) ─────────────────────────────────
interface BaseDef {
  codigo: string;
  nombre: string;
  familia: FamiliaKey;
  descripcion: string;
  cabeza: string[];
  corazon: string[];
  fondo: string[];
  perfil: PreferenceVector;
  sigMod: string; // modificador insignia
  intenso?: boolean; // ofrece también PARFUM
}

const BASES: BaseDef[] = [
  {
    codigo: 'ALBA',
    nombre: 'Alba Cítrica',
    familia: 'CITRICOS',
    descripcion: 'El primer rayo sobre la piel. Chispa que despierta.',
    cabeza: ['Bergamota', 'Limón de Sicilia', 'Pomelo'],
    corazon: ['Neroli', 'Jengibre'],
    fondo: ['Almizcle blanco', 'Cedro claro'],
    perfil: vec({ CITRICOS: 1, ACUATICOS: 0.3, VERDES: 0.2, intensidad: 0.35, calidez: 0.2, dulzor: 0.2 }),
    sigMod: 'MARINA',
  },
  {
    codigo: 'SOL',
    nombre: 'Sol de Mediodía',
    familia: 'CITRICOS',
    descripcion: 'Naranja sanguina al sol. Luz golosa y redonda.',
    cabeza: ['Naranja sanguina', 'Mandarina'],
    corazon: ['Flor de azahar', 'Petitgrain'],
    fondo: ['Almizcle', 'Vainilla suave'],
    perfil: vec({ CITRICOS: 1, FLORALES: 0.3, dulzor: 0.4, calidez: 0.3, intensidad: 0.4 }),
    sigMod: 'DULCE',
  },
  {
    codigo: 'JARDIN',
    nombre: 'Jardín Suspendido',
    familia: 'FLORALES',
    descripcion: 'Pétalos en aire tibio. Delicadeza que respira.',
    cabeza: ['Pera', 'Grosella'],
    corazon: ['Rosa', 'Jazmín', 'Peonía'],
    fondo: ['Almizcle', 'Sándalo'],
    perfil: vec({ FLORALES: 1, dulzor: 0.5, calidez: 0.4, intensidad: 0.4 }),
    sigMod: 'CITRI',
  },
  {
    codigo: 'ROSA',
    nombre: 'Rosa de Medianoche',
    familia: 'FLORALES',
    descripcion: 'Rosa damascena en penumbra. Flor que guarda un secreto.',
    cabeza: ['Frambuesa', 'Pimienta rosa'],
    corazon: ['Rosa damascena', 'Peonía'],
    fondo: ['Pachulí', 'Ámbar'],
    perfil: vec({ FLORALES: 1, ORIENTALES: 0.5, dulzor: 0.6, calidez: 0.5, intensidad: 0.6 }),
    sigMod: 'ESPECIA',
    intenso: true,
  },
  {
    codigo: 'RAIZ',
    nombre: 'Raíz y Humo',
    familia: 'AMADERADOS',
    descripcion: 'Grano y resina. El tiempo hecho aroma.',
    cabeza: ['Pimienta negra', 'Pomelo'],
    corazon: ['Iris', 'Vetiver'],
    fondo: ['Cedro', 'Sándalo', 'Ámbar gris'],
    perfil: vec({ AMADERADOS: 1, VERDES: 0.3, calidez: 0.6, intensidad: 0.6, dulzor: 0.2 }),
    sigMod: 'ESPECIA',
    intenso: true,
  },
  {
    codigo: 'CEDRO',
    nombre: 'Cedro Antiguo',
    familia: 'AMADERADOS',
    descripcion: 'Madera seca y musgo. Sobriedad que ordena una sala.',
    cabeza: ['Bergamota', 'Cardamomo'],
    corazon: ['Cedro del Atlas', 'Ciprés'],
    fondo: ['Vetiver', 'Musgo de roble'],
    perfil: vec({ AMADERADOS: 1, VERDES: 0.4, intensidad: 0.5, calidez: 0.4, dulzor: 0.1 }),
    sigMod: 'VERDE',
  },
  {
    codigo: 'AMBAR',
    nombre: 'Penumbra de Ámbar',
    familia: 'ORIENTALES',
    descripcion: 'Penumbra dorada, ámbar y especia. Intimidad envolvente.',
    cabeza: ['Cardamomo', 'Azafrán'],
    corazon: ['Rosa', 'Incienso'],
    fondo: ['Ámbar', 'Vainilla', 'Oud'],
    perfil: vec({ ORIENTALES: 1, AMADERADOS: 0.4, calidez: 0.8, dulzor: 0.6, intensidad: 0.8 }),
    sigMod: 'DULCE',
    intenso: true,
  },
  {
    codigo: 'INCIENSO',
    nombre: 'Incienso Velado',
    familia: 'ORIENTALES',
    descripcion: 'Humo de templo, mirra y benjuí. Ceremonia en la piel.',
    cabeza: ['Elemí', 'Pimienta negra'],
    corazon: ['Incienso', 'Mirra'],
    fondo: ['Benjuí', 'Maderas oscuras'],
    perfil: vec({ ORIENTALES: 1, AMADERADOS: 0.5, calidez: 0.7, intensidad: 0.8, dulzor: 0.4 }),
    sigMod: 'MADERA',
    intenso: true,
  },
  {
    codigo: 'MAREA',
    nombre: 'Marea Clara',
    familia: 'ACUATICOS',
    descripcion: 'Brisa salina y aire abierto. Respiración limpia.',
    cabeza: ['Notas marinas', 'Bergamota'],
    corazon: ['Jazmín acuático', 'Salvia'],
    fondo: ['Almizcle', 'Maderas claras'],
    perfil: vec({ ACUATICOS: 1, CITRICOS: 0.3, intensidad: 0.35 }),
    sigMod: 'CITRI',
  },
  {
    codigo: 'SAVIA',
    nombre: 'Savia Verde',
    familia: 'VERDES',
    descripcion: 'Tallo partido y hoja húmeda. Frescor terroso.',
    cabeza: ['Galbanum', 'Hoja de higuera'],
    corazon: ['Té verde', 'Violeta'],
    fondo: ['Vetiver', 'Musgo'],
    perfil: vec({ VERDES: 1, ACUATICOS: 0.3, AMADERADOS: 0.3, intensidad: 0.4 }),
    sigMod: 'MARINA',
  },
];

// ── Modificadores ─────────────────────────────────────────────
interface ModDef {
  codigo: string;
  nombre: string;
  nota: string;
  descripcion: string;
  efecto: Partial<PreferenceVector>;
  porcentaje: number;
}

const MODIFICADORES: ModDef[] = [
  { codigo: 'DULCE', nombre: 'Toque Dulce', nota: 'Vainilla de Madagascar', descripcion: 'Calidez golosa que abraza el fondo.', efecto: { dulzor: 0.4, ORIENTALES: 0.2, calidez: 0.2 }, porcentaje: 5 },
  { codigo: 'CITRI', nombre: 'Chispa Cítrica', nota: 'Bergamota de Calabria', descripcion: 'Un destello que ilumina la salida.', efecto: { CITRICOS: 0.35, intensidad: 0.05 }, porcentaje: 4 },
  { codigo: 'FLOR', nombre: 'Corazón Floral', nota: 'Jazmín Sambac', descripcion: 'Un latido de flor en el centro.', efecto: { FLORALES: 0.35, dulzor: 0.1 }, porcentaje: 5 },
  { codigo: 'MADERA', nombre: 'Fondo Amaderado', nota: 'Sándalo de Mysore', descripcion: 'Cimientos cálidos y cremosos.', efecto: { AMADERADOS: 0.35, calidez: 0.2 }, porcentaje: 6 },
  { codigo: 'MARINA', nombre: 'Bruma Marina', nota: 'Acordes salinos', descripcion: 'Aire de mar que despeja.', efecto: { ACUATICOS: 0.3 }, porcentaje: 4 },
  { codigo: 'ESPECIA', nombre: 'Especia Cálida', nota: 'Cardamomo y pimienta', descripcion: 'Brasa especiada que da carácter.', efecto: { ORIENTALES: 0.2, calidez: 0.3, intensidad: 0.1 }, porcentaje: 4 },
  { codigo: 'VERDE', nombre: 'Verde Fresco', nota: 'Galbanum', descripcion: 'Savia que refresca y aterriza.', efecto: { VERDES: 0.3 }, porcentaje: 4 },
];

// ── Packaging ─────────────────────────────────────────────────
const PACKAGING = [
  { id: 'pkg-caja', nombre: 'Caja Premium', descripcion: 'Estuche rígido forrado, cierre magnético y sello de cera.', precioExtra: 9990 },
  { id: 'pkg-tarjeta', nombre: 'Tarjeta Manuscrita', descripcion: 'Mensaje personalizado en caligrafía sobre papel de algodón.', precioExtra: 3990 },
  { id: 'pkg-grabado', nombre: 'Grabado en el Frasco', descripcion: 'El nombre de tu fragancia grabado a láser en el vidrio.', precioExtra: 12990 },
];

const PRECIO_BASE: Record<Intensidad, number> = {
  EDT: 26990,
  EDP: 33990,
  PARFUM: 45990,
};
const EXTRA_50ML: Record<Intensidad, number> = {
  EDT: 9000,
  EDP: 12000,
  PARFUM: 16000,
};

function aplicarMod(
  base: PreferenceVector,
  mod: ModDef | null,
  intensidad: Intensidad
): PreferenceVector {
  const out = { ...base };
  if (mod) {
    const factor = mod.porcentaje / 5; // ponderación suave por %
    for (const [k, v] of Object.entries(mod.efecto)) {
      out[k as keyof PreferenceVector] = clamp01(
        out[k as keyof PreferenceVector] + (v as number) * factor * 0.6
      );
    }
  }
  // La concentración define la proyección (eje intensidad).
  out.intensidad = clamp01(Math.max(out.intensidad, INTENSIDAD_VALUE[intensidad]));
  return out;
}

async function main() {
  console.log('🌱 Seed Perfume Lab — iniciando…');

  // Modificadores
  const modByCodigo = new Map<string, string>();
  for (const m of MODIFICADORES) {
    const id = `mod-${m.codigo.toLowerCase()}`;
    await prisma.modificador.upsert({
      where: { id },
      update: { nombre: m.nombre, nota: m.nota, descripcion: m.descripcion, efectoJson: m.efecto, porcentaje: m.porcentaje, activo: true },
      create: { id, nombre: m.nombre, nota: m.nota, descripcion: m.descripcion, efectoJson: m.efecto, porcentaje: m.porcentaje },
    });
    modByCodigo.set(m.codigo, id);
  }

  // Packaging
  for (const p of PACKAGING) {
    await prisma.packagingOpcion.upsert({
      where: { id: p.id },
      update: { nombre: p.nombre, descripcion: p.descripcion, precioExtra: p.precioExtra, activo: true },
      create: p,
    });
  }

  let nCombos = 0;
  let nProductos = 0;

  for (const b of BASES) {
    const baseId = `base-${b.codigo.toLowerCase()}`;
    await prisma.base.upsert({
      where: { id: baseId },
      update: {
        nombre: b.nombre, familiaOlfativa: b.familia, descripcion: b.descripcion,
        notasCabeza: b.cabeza, notasCorazon: b.corazon, notasFondo: b.fondo,
        perfilJson: b.perfil, activo: true,
      },
      create: {
        id: baseId, nombre: b.nombre, familiaOlfativa: b.familia, descripcion: b.descripcion,
        notasCabeza: b.cabeza, notasCorazon: b.corazon, notasFondo: b.fondo,
        perfilJson: b.perfil,
      },
    });

    // Variantes (combinaciones) por base.
    type Variante = { modCodigo: string | null; intensidad: Intensidad };
    const variantes: Variante[] = [
      { modCodigo: null, intensidad: 'EDT' },
      { modCodigo: null, intensidad: 'EDP' },
      { modCodigo: b.sigMod, intensidad: 'EDP' },
    ];
    if (b.intenso) variantes.push({ modCodigo: b.sigMod, intensidad: 'PARFUM' });

    for (const v of variantes) {
      const mod = v.modCodigo ? MODIFICADORES.find((m) => m.codigo === v.modCodigo)! : null;
      const modId = v.modCodigo ? modByCodigo.get(v.modCodigo)! : null;
      const modPorcentaje = mod ? mod.porcentaje : 0;
      const sku = `PL-${b.codigo}${mod ? '-' + mod.codigo : ''}-${v.intensidad}`;
      const combId = `comb-${b.codigo.toLowerCase()}${mod ? '-' + mod.codigo.toLowerCase() : ''}-${v.intensidad.toLowerCase()}`;
      const vector = aplicarMod(b.perfil, mod, v.intensidad);
      const precioBase = PRECIO_BASE[v.intensidad] + (mod ? 3000 : 0);

      const ficha = {
        baseNombre: b.nombre,
        baseFamilia: b.familia,
        modificador: mod ? { nombre: mod.nombre, nota: mod.nota, porcentaje: mod.porcentaje } : null,
        intensidad: v.intensidad,
        concentracion: v.intensidad === 'EDT' ? '8–12%' : v.intensidad === 'EDP' ? '15–20%' : '20–30%',
        instrucciones: [
          `Partir de la base "${b.nombre}" (${b.familia}).`,
          mod ? `Añadir modificador "${mod.nombre}" (${mod.nota}) al ${mod.porcentaje}%.` : 'Sin modificador.',
          `Llevar a concentración ${v.intensidad} (${v.intensidad === 'EDT' ? '8–12%' : v.intensidad === 'EDP' ? '15–20%' : '20–30%'}).`,
          'Macerar 7 días en frío y oscuridad antes de envasar.',
          'Imprimir etiqueta con el nombre que eligió el cliente.',
        ],
      };

      await prisma.combinacion.upsert({
        where: { id: combId },
        update: { sku, baseId, modificadorId: modId, modPorcentaje, intensidad: v.intensidad, precioBase, fichaJson: ficha, vectorJson: vector, activo: true },
        create: { id: combId, sku, baseId, modificadorId: modId, modPorcentaje, intensidad: v.intensidad, precioBase, fichaJson: ficha, vectorJson: vector },
      });
      nCombos++;

      // Formatos (30ml / 50ml).
      for (const ml of [30, 50]) {
        const prodId = `${combId}-${ml}`;
        const precio = ml === 30 ? precioBase : precioBase + EXTRA_50ML[v.intensidad];
        await prisma.producto.upsert({
          where: { id: prodId },
          update: { combinacionId: combId, nombre: `${INTENSIDAD_LABEL[v.intensidad]} · ${ml} ml`, ml, tipo: v.intensidad, precio, activo: true },
          create: { id: prodId, combinacionId: combId, nombre: `${INTENSIDAD_LABEL[v.intensidad]} · ${ml} ml`, ml, tipo: v.intensidad, precio },
        });
        nProductos++;
      }
    }
  }

  // Admin (create-if-missing — no pisa una clave cambiada).
  const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@perfumelabchile.cl').toLowerCase();
  const adminPass = process.env.ADMIN_PASSWORD ?? 'cambiar-esta-clave';
  const existing = await prisma.adminUser.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.adminUser.create({
      data: { email: adminEmail, nombre: 'Administración', passwordHash: await bcrypt.hash(adminPass, 10) },
    });
    console.log(`👤 Admin creado: ${adminEmail}`);
  } else {
    console.log(`👤 Admin ya existe: ${adminEmail} (clave intacta)`);
  }

  console.log(`✅ Seed completo: ${BASES.length} bases · ${MODIFICADORES.length} modificadores · ${nCombos} combinaciones · ${nProductos} productos · ${PACKAGING.length} packaging`);
}

main()
  .catch((e) => {
    console.error('❌ Seed falló:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
