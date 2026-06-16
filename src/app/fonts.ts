import { Fraunces, Inter } from 'next/font/google';

/**
 * Fuentes auto-alojadas (Next las descarga en build y las sirve desde el propio
 * dominio → sin parpadeo, sin caída a una genérica, sin depender de Google en runtime).
 *
 * Fraunces: serif variable con alma artesanal (títulos).
 * Inter: sans limpia y legible (texto/UI).
 */
export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  style: ['normal', 'italic'],
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: true,
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['system-ui', 'sans-serif'],
});
