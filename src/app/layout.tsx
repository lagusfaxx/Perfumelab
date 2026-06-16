import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SoundProvider } from '@/components/sensory/SoundProvider';

const APP_URL = process.env.APP_URL ?? 'https://perfumelabchile.cl';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Perfume Lab Chile — Diseña tu fragancia',
    template: '%s · Perfume Lab Chile',
  },
  description:
    'No elijas un perfume. Diséñalo. Un ritual de autoconocimiento que traduce quién eres en una fragancia única, con tu nombre y tu historia.',
  keywords: [
    'perfume personalizado',
    'fragancia a medida',
    'perfumería chile',
    'perfume único',
    'regalo perfume',
  ],
  authors: [{ name: 'Perfume Lab Chile' }],
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: APP_URL,
    siteName: 'Perfume Lab Chile',
    title: 'Diseña tu fragancia — Perfume Lab Chile',
    description:
      'Un ritual sensorial que traduce quién eres en una fragancia única, con tu nombre y tu historia.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diseña tu fragancia — Perfume Lab Chile',
    description: 'Un ritual sensorial que traduce quién eres en una fragancia única.',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0c0a0d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Fuentes de display cargadas de forma no bloqueante; degradan a Georgia/system-ui */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap"
        />
      </head>
      <body>
        <SoundProvider>{children}</SoundProvider>
      </body>
    </html>
  );
}
