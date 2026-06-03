import { MOCK_HOME_MATCHES } from '@/data/matches';
import type { HomeMatch } from './types';
import { getOpenfootballFixtures } from './openfootball';
import { enrichWithFootballData } from './football-data';

export type { HomeMatch, TeamLite } from './types';
export { footballDataEnabled } from './football-data';

/** Pick the opener (earliest fixture) + the 4 strongest early marquee fixtures. */
function selectHomeSlice(all: HomeMatch[]): HomeMatch[] {
  const sorted = [...all].sort((a, b) => (a.kickoffISO ?? '').localeCompare(b.kickoffISO ?? ''));
  const opener = sorted[0];
  if (!opener) return MOCK_HOME_MATCHES;
  const marquee = sorted
    .slice(0, 24) // first matchday(s)
    .filter((m) => m.id !== opener.id)
    .sort((a, b) => b.home.strength + b.away.strength - (a.home.strength + a.away.strength))
    .slice(0, 4);
  return [opener, ...marquee];
}

/**
 * Homepage fixtures: real WC2026 data when available, otherwise the mock set —
 * the UI never breaks. Returns [opener, ...4 marquee].
 */
export async function getHomeMatches(): Promise<HomeMatch[]> {
  const real = await getOpenfootballFixtures();
  if (real.length < 5) return MOCK_HOME_MATCHES;
  return enrichWithFootballData(selectHomeSlice(real));
}
