import type { MetadataRoute } from 'next';

const APP_URL = process.env.APP_URL ?? 'https://perfumelabchile.cl';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${APP_URL}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${APP_URL}/ritual`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];
}
