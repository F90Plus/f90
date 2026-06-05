/**
 * Atmosphere asset manifest — the single source for cinematic imagery. Real,
 * founder-owned photos, organized under public/ (hero/ · atmosphere/ · worldcup/)
 * and optimized to WebP (scripts/assets/optimize-images.py). Components treat them
 * via CinematicImageLayer (grade · mask · blur · vignette) — never pasted wallpaper.
 * See docs/ART_DIRECTION_ASSETS.md.
 */
export const ATMOSPHERE = {
  /** Hero cinematic base — night stadium, low pitch angle. */
  heroImage: '/hero/stadium-night.webp' as string | null,
  /** Section backdrops (treated dark). */
  stadiumWide: '/atmosphere/stadium-wide.webp',
  stadiumStands: '/atmosphere/stadium-stands.webp',
  /** World Cup key art — globe of nations. */
  globeFlags: '/worldcup/globe-flags.webp',
  /** The World Cup trophy (transparent cutout) — premium aspirational atmosphere. */
  trophy: '/worldcup/trophy.webp',
} as const;
