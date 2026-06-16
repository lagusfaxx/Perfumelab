import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Label, Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Acceso · Admin',
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const session = await getSession();
  if (session) redirect('/admin');

  const hasError = searchParams?.error === '1';

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas px-6 py-16">
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-brass">Perfume Lab</p>
          <h1 className="mt-2 text-2xl text-ink">Panel de administración</h1>
          <p className="mt-1 text-sm text-ink-muted">Ingresa con tu cuenta de equipo.</p>
        </div>

        {hasError && (
          <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Credenciales inválidas. Intenta nuevamente.
          </div>
        )}

        <form method="POST" action="/api/admin/login" className="space-y-4">
          <div>
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              placeholder="tu@correo.cl"
            />
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" size="md" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </main>
  );
}
