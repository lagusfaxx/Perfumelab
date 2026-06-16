'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function NavLink({
  href,
  children,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        'rounded-full px-4 py-2 text-sm transition-colors',
        active
          ? 'bg-brass/15 text-brass'
          : 'text-ink-soft hover:bg-ink/5 hover:text-ink'
      )}
    >
      {children}
    </Link>
  );
}
