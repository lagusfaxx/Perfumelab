# syntax=docker/dockerfile:1

# Imagen multi-stage optimizada para Next.js standalone + Prisma.
# Base Debian slim (no Alpine) para evitar problemas de engine musl en Prisma.

###############################################################################
# 1) Dependencias
###############################################################################
FROM node:20-slim AS deps
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN npm install -g pnpm@10.33.0
# openssl: requerido por el engine de Prisma
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

###############################################################################
# 2) Build
###############################################################################
FROM node:20-slim AS builder
WORKDIR /app
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install -g pnpm@10.33.0
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# El build no consulta la DB (rutas dinámicas), pero construir PrismaClient
# exige que DATABASE_URL exista. Valor ficticio, nunca se conecta.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build?schema=public"
RUN pnpm prisma generate
RUN pnpm build
# Empaqueta el seed a CJS para ejecutarlo en runtime sin tsx ni fuente TS.
RUN pnpm run seed:bundle

###############################################################################
# 3) Runner
###############################################################################
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates wget \
  && rm -rf /var/lib/apt/lists/*
# Prisma CLI global, sólo para `migrate deploy` en el arranque.
# Debe coincidir con la versión de @prisma/client.
RUN npm install -g prisma@5.22.0 && npm cache clean --force

# Usuario sin privilegios
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Salida standalone: server.js + node_modules mínimos trazados
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# Schema + migraciones + seed empaquetado (migrate deploy + seed en el arranque)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000

# Healthcheck: proceso vivo + conexión a la DB
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
