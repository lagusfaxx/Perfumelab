import Link from 'next/link';
import { Aura } from '@/components/sensory/Aura';
import type { FamiliaKey } from '@/types';

/**
 * Pantalla de estado a página completa (vacío, no encontrado, resultado de pago).
 * Server-friendly: no usa estado ni efectos. La estética sigue al `bg-canvas`.
 */
export function EstadoPantalla({
  eyebrow,
  titulo,
  mensaje,
  familia = null,
  intensity = 0.26,
  children,
}: {
  eyebrow?: string;
  titulo: string;
  mensaje?: React.ReactNode;
  familia?: FamiliaKey | null;
  intensity?: number;
  children?: React.ReactNode;
}) {
  return (
    <Aura
      familia={familia}
      intensity={intensity}
      className="flex min-h-[100dvh] items-center justify-center px-6 py-16"
    >
      <div className="w-full max-w-lg text-center">
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.35em] text-ink-muted">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 text-balance text-4xl text-ink sm:text-5xl">{titulo}</h1>
        {mensaje && (
          <div className="mx-auto mt-5 max-w-md text-pretty text-sm leading-relaxed text-ink-soft">
            {mensaje}
          </div>
        )}
        {children && <div className="mt-8 flex flex-col items-center gap-3">{children}</div>}
      </div>
    </Aura>
  );
}

/** Botón-enlace con la misma forma que `Button` (server-safe, sin 'use client'). */
export function LinkBoton({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base transition-all duration-300 ease-sensory';
  const variants: Record<string, string> = {
    primary: 'bg-brass text-canvas hover:bg-brass-soft shadow-lg shadow-brass/20 font-medium',
    outline: 'border border-brass/40 text-brass hover:border-brass hover:bg-brass/10',
    ghost: 'text-ink-soft hover:text-ink hover:bg-ink/5',
  };
  return (
    <Link href={href} className={`${base} ${variants[variant]}`}>
      {children}
    </Link>
  );
}
