/**
 * F90+ brand manifest — single source of truth for brand assets + raw color
 * values for non-CSS contexts (web manifest, image generation).
 *
 * The OFFICIAL logo is the original render (`logo`). It is the primary identity on
 * every visible surface (header, hero, loading, marketing). The icon PNGs are
 * faithful, derived downscales of that render (see scripts/brand/generate-icons.py)
 * used ONLY for tiny/system cases (favicon, app icon, avatars). Never reinterpret
 * the logo into an abstract mark.
 */
export const BRAND = {
  name: 'F90+',

  /** The official render — primary logo everywhere it's visible. */
  logo: {
    src: '/brand/f90plus-logo.png',
    width: 379,
    height: 398,
    alt: 'F90+',
  },

  /** Derived, system-only assets (downscaled from the render). */
  icons: {
    /** Favicon + app icon are served by Next via app/icon.png & app/apple-icon.png. */
    icon512: '/brand/f90plus-icon-512.png',
    icon192: '/brand/f90plus-icon-192.png',
    maskable512: '/brand/f90plus-maskable-512.png',
  },

  /** Social / Open Graph card (1200×630) — World Cup globe key art. */
  og: '/worldcup/og.webp',

  /** Mirror of the design tokens, as raw hex, for non-CSS rendering surfaces. */
  colors: {
    night: '#05080F',
    nightSurface: '#0B1120',
    led: '#3D74FF',
    volt: '#2BDDF0',
    lime: '#AEF23A',
    gold: '#F4BE54',
    mist: '#E9EEFB',
    mistMuted: '#828FB2',
  },
} as const;
