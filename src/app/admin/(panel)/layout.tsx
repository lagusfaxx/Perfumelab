import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { NavLink } from '@/components/admin/NavLink';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Admin',
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  // Defensa en profundidad (el middleware ya debería bloquear).
  if (!session) redirect('/admin/login');

  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="sticky top-0 z-20 border-b border-ink/10 bg-canvas-soft/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-brass">
              Perfume Lab
            </span>
            <span className="text-xs text-ink-muted">· Admin</span>
          </div>

          <nav className="flex items-center gap-1">
            <NavLink href="/admin" exact>
              Resumen
            </NavLink>
            <NavLink href="/admin/pedidos">Pedidos</NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-ink-muted sm:inline">
              {session.email}
            </span>
            <form method="POST" action="/api/admin/logout">
              <button
                type="submit"
                className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink-soft transition-colors hover:border-ink/30 hover:text-ink"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
