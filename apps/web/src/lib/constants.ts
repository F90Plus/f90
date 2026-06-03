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
 * Primary navigation. Labels are resolved at render time from the `nav`
 * message namespace via each item's `key`. Hrefs are in-page anchors for the
 * foundation phase — they become real routes as features land.
 */
export const NAV_LINKS = [
  { key: 'matches', href: '#matches' },
  { key: 'analyst', href: '#analyst' },
  { key: 'how', href: '#how-it-works' },
  { key: 'rankings', href: '#leaderboard' },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];

/** Where the primary "Play free" CTA points for now. */
export const PLAY_HREF = '#cta';
