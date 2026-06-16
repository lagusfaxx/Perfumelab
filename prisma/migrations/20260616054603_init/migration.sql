-- CreateEnum
CREATE TYPE "FamiliaOlfativa" AS ENUM ('CITRICOS', 'FLORALES', 'AMADERADOS', 'ORIENTALES', 'ACUATICOS', 'VERDES');

-- CreateEnum
CREATE TYPE "Intensidad" AS ENUM ('EDT', 'EDP', 'PARFUM');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'PAGADO', 'RECHAZADO', 'EN_PREPARACION', 'ENVIADO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Base" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "familiaOlfativa" "FamiliaOlfativa" NOT NULL,
    "descripcion" TEXT,
    "notasCabeza" TEXT[],
    "notasCorazon" TEXT[],
    "notasFondo" TEXT[],
    "perfilJson" JSONB NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modificador" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "nota" TEXT NOT NULL,
    "descripcion" TEXT,
    "efectoJson" JSONB NOT NULL,
    "porcentaje" INTEGER NOT NULL DEFAULT 5,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modificador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Combinacion" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "baseId" TEXT NOT NULL,
    "modificadorId" TEXT,
    "modPorcentaje" INTEGER NOT NULL DEFAULT 0,
    "intensidad" "Intensidad" NOT NULL,
    "precioBase" INTEGER NOT NULL,
    "fichaJson" JSONB NOT NULL,
    "vectorJson" JSONB NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Combinacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "combinacionId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ml" INTEGER NOT NULL,
    "tipo" "Intensidad" NOT NULL,
    "precio" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackagingOpcion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precioExtra" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackagingOpcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerfilOlfativo" (
    "id" TEXT NOT NULL,
    "respuestasJson" JSONB NOT NULL,
    "vectorJson" JSONB NOT NULL,
    "combinacionId" TEXT NOT NULL,
    "alternativasJson" JSONB,
    "nombreFragancia" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerfilOlfativo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "nombreFraganciaCliente" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "formatoLabel" TEXT NOT NULL,
    "clienteNombre" TEXT NOT NULL,
    "clienteRut" TEXT NOT NULL,
    "clienteEmail" TEXT NOT NULL,
    "clienteTelefono" TEXT NOT NULL,
    "dirRegion" TEXT NOT NULL,
    "dirComuna" TEXT NOT NULL,
    "dirCalle" TEXT NOT NULL,
    "dirNumero" TEXT NOT NULL,
    "dirDepto" TEXT,
    "dirReferencias" TEXT,
    "montoProducto" INTEGER NOT NULL,
    "montoPackaging" INTEGER NOT NULL DEFAULT 0,
    "montoEnvio" INTEGER NOT NULL DEFAULT 0,
    "montoTotal" INTEGER NOT NULL,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "flowToken" TEXT,
    "flowOrder" TEXT,
    "flowStatus" INTEGER,
    "flowPaymentJson" JSONB,
    "notaProduccion" TEXT,
    "trackingEnvio" TEXT,
    "emailEnviado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PackagingOpcionToPedido" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Combinacion_sku_key" ON "Combinacion"("sku");

-- CreateIndex
CREATE INDEX "Combinacion_activo_idx" ON "Combinacion"("activo");

-- CreateIndex
CREATE INDEX "Producto_combinacionId_idx" ON "Producto"("combinacionId");

-- CreateIndex
CREATE INDEX "PerfilOlfativo_combinacionId_idx" ON "PerfilOlfativo"("combinacionId");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numero_key" ON "Pedido"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_flowToken_key" ON "Pedido"("flowToken");

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE INDEX "Pedido_createdAt_idx" ON "Pedido"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "_PackagingOpcionToPedido_AB_unique" ON "_PackagingOpcionToPedido"("A", "B");

-- CreateIndex
CREATE INDEX "_PackagingOpcionToPedido_B_index" ON "_PackagingOpcionToPedido"("B");

-- AddForeignKey
ALTER TABLE "Combinacion" ADD CONSTRAINT "Combinacion_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "Base"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Combinacion" ADD CONSTRAINT "Combinacion_modificadorId_fkey" FOREIGN KEY ("modificadorId") REFERENCES "Modificador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_combinacionId_fkey" FOREIGN KEY ("combinacionId") REFERENCES "Combinacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerfilOlfativo" ADD CONSTRAINT "PerfilOlfativo_combinacionId_fkey" FOREIGN KEY ("combinacionId") REFERENCES "Combinacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "PerfilOlfativo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackagingOpcionToPedido" ADD CONSTRAINT "_PackagingOpcionToPedido_A_fkey" FOREIGN KEY ("A") REFERENCES "PackagingOpcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PackagingOpcionToPedido" ADD CONSTRAINT "_PackagingOpcionToPedido_B_fkey" FOREIGN KEY ("B") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;
