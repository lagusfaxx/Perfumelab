import type { MetadataRoute } from 'next';

const APP_URL = process.env.APP_URL ?? 'https://perfumelabchile.cl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/pago'],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
