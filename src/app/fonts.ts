import { Marcellus, Mulish } from 'next/font/google';

/**
 * Fuentes auto-alojadas (Next las descarga en build y las sirve desde el dominio).
 * Dirección: minimalista + natural (apotecario botánico), lejos del look "tech/IA".
 *
 * Marcellus: romana serena, inscripcional, con calma natural (títulos).
 * Mulish: sans humanista, redonda y discreta (texto/UI).
 */
export const displayFont = Marcellus({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-serif',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
  adjustFontFallback: false,
});

export const bodyFont = Mulish({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  fallback: ['system-ui', 'sans-serif'],
});
