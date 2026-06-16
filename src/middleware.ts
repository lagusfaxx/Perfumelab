import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Edge-safe: NO importar src/lib/auth.ts (arrastra prisma/bcrypt, no soportados en edge).
const COOKIE = 'pl_admin_session';
const secret = () =>
  new TextEncoder().encode(
    process.env.ADMIN_SESSION_SECRET ?? 'dev-insecure-secret-change-me'
  );

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sólo proteger /admin/**, dejando libre /admin/login.
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE)?.value;
  if (token) {
    try {
      await jwtVerify(token, secret());
      return NextResponse.next();
    } catch {
      // token inválido / expirado → cae al redirect
    }
  }

  const loginUrl = new URL('/admin/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*'],
};
