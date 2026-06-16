#!/bin/sh
set -e

echo "▶ Aplicando migraciones (prisma migrate deploy)…"
prisma migrate deploy --schema=./prisma/schema.prisma

echo "▶ Sembrando catálogo base (idempotente)…"
if ! node ./prisma/seed.cjs; then
  echo "⚠ El seed falló; el servidor arranca igual (catálogo puede estar incompleto)."
fi

echo "▶ Iniciando Perfume Lab en :${PORT:-3000}…"
exec node server.js
