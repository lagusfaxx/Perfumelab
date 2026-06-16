import type { Config } from 'tailwindcss';

/**
 * Sistema de diseño sensorial.
 * Cada familia olfativa tiene su propio lenguaje cromático.
 * Estos tokens se consumen tanto en Tailwind como (vía CSS vars) en componentes.
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Lienzo base — íntimo, casi negro cálido
        canvas: {
          DEFAULT: '#0c0a0d',
          soft: '#15121a',
          raised: '#1d1922',
        },
        ink: {
          DEFAULT: '#f4eee9',
          soft: '#cabfc0',
          muted: '#8a7f88',
        },
        // Acento de marca (dorado apagado / latón de frasco)
        brass: {
          DEFAULT: '#c9a44c',
          soft: '#e3c878',
          deep: '#8a6f2e',
        },
        // Paletas por familia olfativa (sinestesia)
        citrus: { DEFAULT: '#e9d23b', soft: '#f6ef9a', deep: '#9bbf2e' },
        woody: { DEFAULT: '#8a5a2b', soft: '#c69366', deep: '#4a3018' },
        floral: { DEFAULT: '#e7a6c4', soft: '#f7d6e6', deep: '#b76a91' },
        oriental: { DEFAULT: '#7d4fb0', soft: '#caa9e8', deep: '#3c2160' },
        aquatic: { DEFAULT: '#3ba0d8', soft: '#a9dcf2', deep: '#1c5e85' },
        herbal: { DEFAULT: '#5fae6e', soft: '#aedeb8', deep: '#2f6b3c' },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        breathe: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.06)' },
        },
        drift: {
          '0%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-14px) translateX(8px)' },
          '100%': { transform: 'translateY(0) translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        breathe: 'breathe 7s ease-in-out infinite',
        drift: 'drift 12s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
      },
      backgroundImage: {
        'aura-radial':
          'radial-gradient(ellipse at center, var(--aura-from) 0%, transparent 70%)',
      },
      transitionTimingFunction: {
        sensory: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
