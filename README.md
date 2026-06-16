# Perfume Lab Chile

> No elijas un perfume. **Diséñalo.**

E-commerce de perfumes personalizados donde el valor central es la **experiencia sensorial**. El usuario recorre un cuestionario-ritual que traduce quién es en una fragancia única — con su nombre, su narrativa y un objeto hecho sólo para él — y la compra con la pasarela chilena **FLOW**.

El olfato no se transmite por pantalla, así que lo evocamos con **sinestesia**: cada familia olfativa tiene su propio color, movimiento (Framer Motion + partículas) y sonido (Web Audio API, sintetizado, sin assets pesados).

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| ORM / DB | Prisma + PostgreSQL |
| Estilos | Tailwind CSS + Framer Motion |
| Sonido | Web Audio API (osciladores sintetizados) |
| Pagos | FLOW (`payment/create` + webhook `getStatus`, firma HMAC-SHA256) |
| Email | Resend (opcional) |
| Auth admin | Sesión JWT (`jose`) + cookie httpOnly + bcrypt |
| Deploy | Dockerfile multi-stage (standalone) + docker-compose + healthcheck |
| Gestor | pnpm |

---

## Arquitectura del producto

```
Hero cinematográfico ──▶ /ritual ──▶ POST /api/perfil ──▶ /revelacion/[id] ──▶ /checkout?perfil=ID
   (saltable)            (7 pasos)    (scoring server)     (renombrar + CTA)      (formato + datos)
                                                                                       │
                                                          POST /api/flow/create ◀──────┘
                                                                  │ crea Pedido PENDIENTE + llama FLOW
                                                                  ▼
                                                          redirect a FLOW ──▶ paga ──▶ webhook
                                                                                   /api/flow/confirm
                                                                                   (fuente de verdad)
                                                                                   PAGADO + email
```

### El motor de mapeo (lógica de negocio)
Las respuestas **nunca generan fórmulas libres**. Se mapean a un **SKU pre-aprobado**:

1. `respuestas → vector de preferencias` (afinidad por 6 familias + ejes intensidad/calidez/dulzor) — `src/lib/mapping.ts`.
2. `vector → scoring` contra las combinaciones válidas (coseno de familias + cercanía de ejes).
3. Se elige el **mejor match** + 1–2 alternativas.

Catálogo: **Base** (fórmula madre) + **Modificador** (nota en % controlado) + **Intensidad** (EDT/EDP/PARFUM) = **Combinación** (SKU). Cada combinación se vende en **Productos/Formatos** (30/50 ml) y admite **add-ons de packaging**.

---

## Desarrollo local

### Requisitos
- Node 20+
- pnpm 10+
- PostgreSQL (o Docker para levantarlo)

### Pasos

```bash
# 1. Instalar dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env
#   edita .env: DATABASE_URL, llaves FLOW (sandbox), ADMIN_*, etc.

# 3. Levantar Postgres (opción rápida con Docker)
docker run -d --name pl-pg -e POSTGRES_USER=perfumelab \
  -e POSTGRES_PASSWORD=perfumelab -e POSTGRES_DB=perfumelab \
  -p 5432:5432 postgres:16-alpine

# 4. Migraciones + seed (10 bases, 7 modificadores, 34 combinaciones, packaging, admin)
pnpm prisma migrate deploy
pnpm db:seed

# 5. Dev server
pnpm dev
```

App en `http://localhost:3000` · Admin en `http://localhost:3000/admin` (credenciales `ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### Scripts útiles
| Script | Qué hace |
|--------|----------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | `prisma generate` + `next build` (standalone) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:seed` | Siembra catálogo (idempotente) |
| `pnpm prisma:studio` | Inspector visual de la DB |
| `pnpm seed:bundle` | Empaqueta el seed a `prisma/seed.cjs` (lo usa Docker) |

---

## Deploy con Docker

```bash
cp .env.example .env   # completa los valores de producción
docker compose up -d --build
```

El contenedor `web` al arrancar:
1. `prisma migrate deploy` — aplica migraciones.
2. `node prisma/seed.cjs` — siembra el catálogo (idempotente; **no toca pedidos**).
3. `node server.js` — levanta Next.js standalone.

Healthcheck en `GET /api/health` (verifica proceso + conexión a la DB).

### Deploy en Coolify

1. **Nuevo recurso → Docker Compose** apuntando a este repo (Coolify detecta `docker-compose.yml`).
2. Define las **variables de entorno** (sección abajo) en el panel de Coolify. Importante: `APP_URL=https://perfumelabchile.cl`.
3. Coolify construye con el `Dockerfile` (multi-stage, salida standalone) y conecta `web` ↔ `db` por la red interna.
4. **Dominio**: asígnalo en Coolify (`perfumelabchile.cl`). Coolify gestiona Traefik y el certificado.
5. **Cloudflare DNS**: registro `A`/`CNAME` del dominio → IP del servidor, con el **proxy de Cloudflare activado** (naranja). Usa modo SSL **Full (strict)**. Si usas el proxy, asegúrate de que Traefik resuelva el certificado (o usa certificados de Cloudflare Origin).
6. Persistencia: el volumen `pgdata` guarda la base. Respáldalo.

> Si prefieres Postgres gestionado aparte, borra el servicio `db` del compose y apunta `DATABASE_URL` a tu instancia.

---

## Configurar el webhook de FLOW

FLOW notifica el pago **server-to-server** (es la fuente de verdad; el usuario puede cerrar el navegador). El código ya envía las URLs correctas a FLOW en `payment/create`:

| URL | Endpoint | Para qué |
|-----|----------|----------|
| `urlConfirmation` | `https://TU_DOMINIO/api/flow/confirm` | Webhook: confirma el pago (idempotente) y dispara el email |
| `urlReturn` | `https://TU_DOMINIO/api/flow/return` | Retorno del navegador → redirige a `/pago/retorno` |

Estas se construyen a partir de `APP_URL`, así que **basta con setear `APP_URL` correctamente**. En el panel de FLOW sólo necesitas tu `apiKey` y `secretKey`.

- **Sandbox**: `FLOW_API_URL=https://sandbox.flow.cl/api`
- **Producción**: `FLOW_API_URL=https://www.flow.cl/api`

La firma se calcula con HMAC-SHA256 sobre los parámetros **ordenados alfabéticamente** (`src/lib/flow.ts`). El webhook es **idempotente**: un reintento no duplica el email ni el cambio de estado.

> El `urlConfirmation` debe ser accesible públicamente por FLOW. Detrás de Cloudflare, no bloquees `/api/flow/*` con reglas de bot/WAF.

---

## Variables de entorno

Ver `.env.example` para la lista completa y comentada.

| Variable | Requerida | Descripción |
|----------|:---:|-------------|
| `APP_URL` | ✅ | URL pública (sin slash final). Define las URLs del webhook FLOW, OG, sitemap. |
| `DATABASE_URL` | ✅ | Conexión PostgreSQL. |
| `FLOW_API_KEY` / `FLOW_SECRET_KEY` | ✅ | Llaves de FLOW. |
| `FLOW_API_URL` | ✅ | Sandbox o producción. |
| `ADMIN_SESSION_SECRET` | ✅ | Secreto para firmar la sesión admin (`openssl rand -base64 48`). |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | ✅ | Primer admin (creado en el seed). |
| `RESEND_API_KEY` | ➖ | Email de confirmación. Si falta, se omite sin romper. |
| `EMAIL_FROM` | ➖ | Remitente verificado en Resend. |

---

## Panel de administración (`/admin`)

Protegido por middleware (sesión JWT). Funcionalidades:

- **Resumen**: ventas del periodo, nº de pedidos, ticket promedio, bases y familias más pedidas.
- **Pedidos**: listado con filtros por estado y búsqueda; **exportación a CSV**.
- **Detalle**: datos de cliente, dirección, fragancia diseñada (base + modificador + % + intensidad + nombre del cliente), montos, estado FLOW.
- **Workflow de estado**: Pendiente → Pagado → En preparación → Enviado → Entregado (+ Cancelado), con tracking y notas.
- **Ficha de producción imprimible** (`/admin/pedidos/[id]/ficha`): qué base macerar, qué modificador y en qué %, la concentración y la **etiqueta a imprimir** con el nombre que eligió el cliente.

---

## Modelo de datos

`Base` · `Modificador` · `Combinacion` (SKU) · `Producto` (formato) · `PackagingOpcion` · `PerfilOlfativo` (resultado del ritual) · `Pedido` · `AdminUser`. Esquema completo en `prisma/schema.prisma`.

---

## Accesibilidad y performance

- **Mobile-first**: el ritual y las animaciones están pensados para el celular.
- Respeta `prefers-reduced-motion` (corta animaciones y partículas).
- Audio **siempre opcional** (toggle, nunca autoplay).
- Sonido sintetizado (sin descargas), partículas en canvas, imágenes vía `next/image`, OG generado como PNG.
- SEO: metadata + OpenGraph + `sitemap.xml` + `robots.txt`.

---

Hecho a mano en Chile. 🇨🇱
