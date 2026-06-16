import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { crearPago } from '@/lib/flow';
import { generarNumeroPedido, validarRut } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const bodySchema = z.object({
  perfilId: z.string().min(1),
  productoId: z.string().min(1),
  packagingIds: z.array(z.string().min(1)).default([]),
  clienteNombre: z.string().trim().min(1, 'Nombre requerido'),
  clienteRut: z.string().trim().min(1, 'RUT requerido'),
  clienteEmail: z.string().trim().email('Correo inválido'),
  clienteTelefono: z.string().trim().min(1, 'Teléfono requerido'),
  dirRegion: z.string().trim().min(1, 'Región requerida'),
  dirComuna: z.string().trim().min(1, 'Comuna requerida'),
  dirCalle: z.string().trim().min(1, 'Calle requerida'),
  dirNumero: z.string().trim().min(1, 'Número requerido'),
  dirDepto: z.string().trim().optional(),
  dirReferencias: z.string().trim().optional(),
});

export async function POST(req: Request) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    const json = await req.json();
    const result = bodySchema.safeParse(json);
    if (!result.success) {
      const first = result.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json({ error: first }, { status: 400 });
    }
    parsed = result.data;
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
  }

  // Revalidación de RUT en el servidor.
  if (!validarRut(parsed.clienteRut)) {
    return NextResponse.json({ error: 'RUT inválido' }, { status: 400 });
  }

  try {
    // Producto (con su combinación) y perfil para snapshots.
    const producto = await prisma.producto.findFirst({
      where: { id: parsed.productoId, activo: true },
      include: { combinacion: true },
    });
    if (!producto) {
      return NextResponse.json(
        { error: 'El formato seleccionado no está disponible' },
        { status: 400 }
      );
    }

    const perfil = await prisma.perfilOlfativo.findUnique({
      where: { id: parsed.perfilId },
    });
    if (!perfil) {
      return NextResponse.json(
        { error: 'No encontramos tu fragancia. Vuelve a empezar el ritual.' },
        { status: 400 }
      );
    }
    // El producto debe pertenecer a la combinación del perfil.
    if (producto.combinacionId !== perfil.combinacionId) {
      return NextResponse.json(
        { error: 'El formato no corresponde a tu fragancia' },
        { status: 400 }
      );
    }

    // Packaging seleccionado (sólo activos y existentes).
    const packagingRows = parsed.packagingIds.length
      ? await prisma.packagingOpcion.findMany({
          where: { id: { in: parsed.packagingIds }, activo: true },
        })
      : [];

    // Montos (CLP enteros).
    const montoProducto = producto.precio;
    const montoPackaging = packagingRows.reduce((acc, p) => acc + p.precioExtra, 0);
    const montoEnvio = 0;
    const montoTotal = montoProducto + montoPackaging + montoEnvio;

    // Crear pedido con número único (reintenta ante colisión P2002).
    const pedido = await crearPedidoConNumeroUnico({
      perfilId: perfil.id,
      nombreFraganciaCliente: perfil.nombreFragancia,
      productoId: producto.id,
      formatoLabel: producto.nombre,
      packagingIds: packagingRows.map((p) => p.id),
      cliente: parsed,
      montoProducto,
      montoPackaging,
      montoEnvio,
      montoTotal,
    });

    // Iniciar pago en FLOW.
    const pago = await crearPago({
      commerceOrder: pedido.numero,
      subject: `Perfume Lab — ${perfil.nombreFragancia}`,
      amount: montoTotal,
      email: parsed.clienteEmail,
      urlConfirmation: `${env.appUrl}/api/flow/confirm`,
      urlReturn: `${env.appUrl}/api/flow/return`,
      optional: { pedido: pedido.numero },
    });

    // Persistir token + orden de FLOW.
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: {
        flowToken: pago.token,
        flowOrder: String(pago.flowOrder),
      },
    });

    return NextResponse.json({ redirectUrl: pago.redirectUrl });
  } catch (err) {
    console.error('[flow/create] error iniciando pago', err);
    return NextResponse.json(
      { error: 'No se pudo iniciar el pago' },
      { status: 500 }
    );
  }
}

interface CrearPedidoArgs {
  perfilId: string;
  nombreFraganciaCliente: string;
  productoId: string;
  formatoLabel: string;
  packagingIds: string[];
  cliente: z.infer<typeof bodySchema>;
  montoProducto: number;
  montoPackaging: number;
  montoEnvio: number;
  montoTotal: number;
}

async function crearPedidoConNumeroUnico(args: CrearPedidoArgs) {
  const data = (numero: string): Prisma.PedidoCreateInput => ({
    numero,
    perfil: { connect: { id: args.perfilId } },
    nombreFraganciaCliente: args.nombreFraganciaCliente,
    producto: { connect: { id: args.productoId } },
    formatoLabel: args.formatoLabel,
    packaging: args.packagingIds.length
      ? { connect: args.packagingIds.map((id) => ({ id })) }
      : undefined,
    clienteNombre: args.cliente.clienteNombre,
    clienteRut: args.cliente.clienteRut,
    clienteEmail: args.cliente.clienteEmail,
    clienteTelefono: args.cliente.clienteTelefono,
    dirRegion: args.cliente.dirRegion,
    dirComuna: args.cliente.dirComuna,
    dirCalle: args.cliente.dirCalle,
    dirNumero: args.cliente.dirNumero,
    dirDepto: args.cliente.dirDepto ?? null,
    dirReferencias: args.cliente.dirReferencias ?? null,
    montoProducto: args.montoProducto,
    montoPackaging: args.montoPackaging,
    montoEnvio: args.montoEnvio,
    montoTotal: args.montoTotal,
  });

  let lastErr: unknown;
  for (let intento = 0; intento < 5; intento++) {
    try {
      return await prisma.pedido.create({ data: data(generarNumeroPedido()) });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        lastErr = err;
        continue; // colisión de `numero` único → reintentar
      }
      throw err;
    }
  }
  throw lastErr ?? new Error('No se pudo generar un número de pedido único');
}
