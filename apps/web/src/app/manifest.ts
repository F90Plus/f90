import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

/** PWA web app manifest — icons derive from the official render. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'F90+ — World Cup 2026 predictions',
    short_name: 'F90+',
    description: 'The social, free-to-play way to predict the 2026 World Cup.',
    start_url: '/',
    display: 'standalone',
    background_color: BRAND.colors.night,
    theme_color: BRAND.colors.led,
    icons: [
      { src: BRAND.icons.icon192, sizes: '192x192', type: 'image/png' },
      { src: BRAND.icons.icon512, sizes: '512x512', type: 'image/png' },
      {
        src: BRAND.icons.maskable512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
