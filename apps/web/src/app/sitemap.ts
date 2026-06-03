import type { MetadataRoute } from 'next';

const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://f90.xyz';

/** Both locales (es at `/`, en at `/en`) with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: { languages: { es: `${base}/`, en: `${base}/en` } },
    },
    {
      url: `${base}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
