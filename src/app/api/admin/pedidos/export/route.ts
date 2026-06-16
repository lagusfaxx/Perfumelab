import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { EstadoPedido, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ESTADOS, ESTADO_LABEL } from '@/components/admin/estado';
import { INTENSIDAD_LABEL, FAMILIAS } from '@/lib/families';
import { formatFecha, formatRut } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isEstado(v: string): v is EstadoPedido {
  return (ESTADOS as string[]).includes(v);
}

function familiaLabel(key: string): string {
  return (FAMILIAS as Record<string, { nombre: string }>)[key]?.nombre ?? key;
}

/** Escapa un campo CSV: envuelve en comillas y duplica comillas internas. */
function esc(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new NextResponse('No autorizado', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const estadoParam = searchParams.get('estado')?.trim() ?? '';
  const q = searchParams.get('q')?.trim() ?? '';

  const where: Prisma.PedidoWhereInput = {};
  if (estadoParam && isEstado(estadoParam)) {
    where.estado = estadoParam;
  }
  if (q) {
    where.OR = [
      { numero: { contains: q, mode: 'insensitive' } },
      { clienteNombre: { contains: q, mode: 'insensitive' } },
      { clienteEmail: { contains: q, mode: 'insensitive' } },
      { nombreFraganciaCliente: { contains: q, mode: 'insensitive' } },
    ];
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      perfil: {
        include: {
          combinacion: { include: { base: true, modificador: true } },
        },
      },
      packaging: true,
    },
  });

  const headers = [
    'Numero',
    'Fecha',
    'Estado',
    'Cliente',
    'RUT',
    'Email',
    'Telefono',
    'Region',
    'Comuna',
    'Calle',
    'Numero',
    'Depto',
    'Fragancia',
    'Base',
    'Modificador',
    'Intensidad',
    'Formato',
    'Packaging',
    'Total',
  ];

  const lines: string[] = [headers.map(esc).join(',')];

  for (const p of pedidos) {
    const comb = p.perfil?.combinacion;
    const base = comb?.base;
    const mod = comb?.modificador;
    const modText = mod
      ? `${mod.nombre} (${comb?.modPorcentaje ?? 0}%)`
      : 'Sin modificador';
    const intensidad = comb
      ? INTENSIDAD_LABEL[comb.intensidad] ?? comb.intensidad
      : '';
    const packaging = p.packaging.map((pk) => pk.nombre).join(' + ');

    const row = [
      p.numero,
      formatFecha(p.createdAt),
      ESTADO_LABEL[p.estado],
      p.clienteNombre,
      formatRut(p.clienteRut),
      p.clienteEmail,
      p.clienteTelefono,
      p.dirRegion,
      p.dirComuna,
      p.dirCalle,
      p.dirNumero,
      p.dirDepto ?? '',
      p.nombreFraganciaCliente,
      base ? `${base.nombre} - ${familiaLabel(base.familiaOlfativa)}` : '',
      modText,
      intensidad,
      p.formatoLabel,
      packaging,
      p.montoTotal,
    ];
    lines.push(row.map(esc).join(','));
  }

  // BOM UTF-8 para que Excel lea acentos.
  const body = '﻿' + lines.join('\r\n');

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="pedidos.csv"',
    },
  });
}
