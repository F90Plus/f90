/**
 * Shared openfootball parsing helpers. Extracted so the fixtures reader, the globe
 * nations layer, and the tournament reader all agree on what counts as a real team
 * and how to read openfootball's date/time strings (e.g. "13:00 UTC-6").
 */

/**
 * openfootball/worldcup.json (2026) — public domain, no API key. The single
 * canonical source URL, shared by the fixtures reader, the globe nations layer,
 * and the tournament reader. Cache-first (revalidate 6h); callers never throw.
 */
export const OPENFOOTBALL_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

// Knockout slots are placeholders ("Winner Group A", "1A", "3A/B/C/D/F"); group-stage
// entries are real country names (no digits, no placeholder words).
const PLACEHOLDER = /winner|runner|loser|place|tbd|play-?off|tba/i;

export function isRealTeam(s: string | undefined): s is string {
  return typeof s === 'string' && s.length > 1 && !PLACEHOLDER.test(s) && !/\d/.test(s);
}

export function parseKickoffISO(date: string | undefined, time: string | undefined): string | null {
  if (!date) return null;
  const [py, pmo, pd] = date.split('-');
  const y = Number(py);
  const mo = Number(pmo);
  const d = Number(pd);
  if (!y || !mo || !d) return null;
  const m = /(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})?/.exec(time ?? '');
  const hh = Number(m?.[1] ?? 12);
  const mm = Number(m?.[2] ?? 0);
  const off = Number(m?.[3] ?? 0); // local time at `off` → UTC hour = local - off
  return new Date(Date.UTC(y, mo - 1, d, hh - off, mm)).toISOString();
}

export function timeLabelFrom(time: string | undefined): string | null {
  const m = /(\d{1,2}):(\d{2})/.exec(time ?? '');
  return m ? `${m[1]?.padStart(2, '0')}:${m[2]}` : null;
}
