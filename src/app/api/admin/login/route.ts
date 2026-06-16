import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { autenticar, crearToken, cookieOptions, SESSION_COOKIE } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const email = String(form.get('email') ?? '');
  const password = String(form.get('password') ?? '');

  const session = await autenticar(email, password);
  if (!session) {
    return NextResponse.redirect(new URL('/admin/login?error=1', req.url), 303);
  }

  const token = await crearToken(session);
  cookies().set(SESSION_COOKIE, token, cookieOptions());

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
