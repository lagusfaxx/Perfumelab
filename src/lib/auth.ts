import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { env } from './env';

export const SESSION_COOKIE = 'pl_admin_session';
const ALG = 'HS256';
const MAX_AGE = 60 * 60 * 8; // 8 horas

function secretKey() {
  return new TextEncoder().encode(env.admin.sessionSecret);
}

export interface AdminSession {
  sub: string; // adminId
  email: string;
  nombre?: string;
}

export async function crearToken(session: AdminSession): Promise<string> {
  return new SignJWT({ email: session.email, nombre: session.nombre })
    .setProtectedHeader({ alg: ALG })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function verificarToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      nombre: payload.nombre ? String(payload.nombre) : undefined,
    };
  } catch {
    return null;
  }
}

/** Lee la sesión desde la cookie (server components / route handlers). */
export async function getSession(): Promise<AdminSession | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verificarToken(token);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: MAX_AGE,
  };
}

/** Verifica credenciales contra AdminUser. */
export async function autenticar(
  email: string,
  password: string
): Promise<AdminSession | null> {
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return null;
  return { sub: admin.id, email: admin.email, nombre: admin.nombre ?? undefined };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
