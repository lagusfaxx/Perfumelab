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
        // Lienzo base — tierra cálida, casi negro con fondo orgánico
        canvas: {
          DEFAULT: '#15120d',
          soft: '#1e1a14',
          raised: '#28221a',
        },
        ink: {
          DEFAULT: '#ece4d6',
          soft: '#c2b6a4',
          muted: '#8b8073',
        },
        // Acento de marca: arcilla / tierra (natural, no dorado brillante)
        brass: {
          DEFAULT: '#c0875c',
          soft: '#d6a87d',
          deep: '#8a5f3a',
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
