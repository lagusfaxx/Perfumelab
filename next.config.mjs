/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output → imagen Docker mínima (server.js + node_modules trazados)
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.perfumelabchile.cl' },
    ],
  },
  experimental: {
    // Asegura que prisma se empaquete bien en standalone
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
};

export default nextConfig;
