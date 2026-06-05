/**
 * App-wide constants. No copy here (that lives in `locales/`) — only structural
 * values and configuration the UI is built around.
 */

export const APP_NAME = 'F90+';

/**
 * 2026 World Cup opening match. Drives the homepage countdown.
 * (Opener: 11 June 2026.) Stored as an absolute instant so the countdown is
 * unambiguous across timezones; the client renders it in local time.
 */
export const WORLD_CUP_KICKOFF_ISO = '2026-06-11T19:00:00Z';

/**
 * Landing navigation (signed-out). Labels are resolved at render time from the
 * `nav` message namespace via each item's `key`. Hrefs are in-page anchors on the
 * marketing landing — they coexist with the real authenticated routes below.
 */
export const NAV_LINKS = [
  { key: 'matches', href: '#tournament' },
  { key: 'analyst', href: '#analyst' },
  { key: 'how', href: '#how-it-works' },
  { key: 'fantasy', href: '#fantasy' },
  { key: 'rankings', href: '#leaderboard' },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];

/**
 * Authenticated navigation (signed-in). Real in-app routes the header + footer
 * expose once there's a session — so the primary nav never dead-ends on a
 * landing-only anchor. Rendered with the locale-aware next-intl `<Link>`.
 */
export const APP_NAV_LINKS = [
  { key: 'home', href: '/home' },
  { key: 'predictions', href: '/predictions' },
  { key: 'rankings', href: '/ranking' },
] as const;

export type AppNavLink = (typeof APP_NAV_LINKS)[number];

/** Where the primary "Play free" acquisition CTA points (signed-out only). */
export const PLAY_HREF = '#cta';
