/**
 * Acceso centralizado a variables de entorno.
 * Lectura perezosa: no se valida en import para no romper el build.
 */

function req(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return v;
}

export const env = {
  get databaseUrl() {
    return req('DATABASE_URL');
  },
  get appUrl() {
    return req('APP_URL', 'http://localhost:3000').replace(/\/$/, '');
  },
  flow: {
    get apiKey() {
      return req('FLOW_API_KEY');
    },
    get secretKey() {
      return req('FLOW_SECRET_KEY');
    },
    /** sandbox: https://sandbox.flow.cl/api · prod: https://www.flow.cl/api */
    get baseUrl() {
      return req('FLOW_API_URL', 'https://sandbox.flow.cl/api').replace(/\/$/, '');
    },
  },
  admin: {
    get sessionSecret() {
      return req('ADMIN_SESSION_SECRET', 'dev-insecure-secret-change-me');
    },
  },
  email: {
    get resendApiKey() {
      return process.env.RESEND_API_KEY ?? '';
    },
    get from() {
      return process.env.EMAIL_FROM ?? 'Perfume Lab <pedidos@perfumelabchile.cl>';
    },
  },
} as const;

export const isProd = process.env.NODE_ENV === 'production';
