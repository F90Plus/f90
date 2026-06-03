import type { HomeMatch } from './types';

/**
 * football-data.org enrichment — REAL implementation, ENV-GATED.
 *
 * Free forever, World Cup included, but needs an API key (register at
 * football-data.org → `X-Auth-Token`). Activates only when `COPILOT_SOURCE=live`
 * AND `FOOTBALL_DATA_API_KEY` is set. Until then it's a graceful no-op and the
 * model + openfootball carry the experience. Cached (revalidate) to respect the
 * free tier (10 req/min).
 */
const BASE = 'https://api.football-data.org/v4';
const WC_COMPETITION = 'WC';

function apiKey(): string {
  return process.env.FOOTBALL_DATA_API_KEY ?? '';
}

export function footballDataEnabled(): boolean {
  return process.env.COPILOT_SOURCE === 'live' && apiKey() !== '';
}

export interface GroupStanding {
  position: number;
  team: string;
  points: number;
  playedGames: number;
}

/** Real WC group standings. Returns null when disabled or on any failure. */
export async function getWorldCupStandings(): Promise<GroupStanding[] | null> {
  if (!footballDataEnabled()) return null;
  try {
    const res = await fetch(`${BASE}/competitions/${WC_COMPETITION}/standings`, {
      headers: { 'X-Auth-Token': apiKey() },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      standings?: Array<{ table?: Array<{ position: number; team: { name: string }; points: number; playedGames: number }> }>;
    };
    return (data.standings ?? []).flatMap((s) =>
      (s.table ?? []).map((r) => ({
        position: r.position,
        team: r.team.name,
        points: r.points,
        playedGames: r.playedGames,
      })),
    );
  } catch {
    return null;
  }
}

/**
 * Enrich fixtures with real form/standings once live. No key → returns the
 * fixtures unchanged (graceful degradation). The seam is here for when a key
 * lands; nothing above this layer changes.
 */
export async function enrichWithFootballData(matches: HomeMatch[]): Promise<HomeMatch[]> {
  if (!footballDataEnabled()) return matches;
  // TODO(live): map standings → adjust strengths / attach form when a key is set.
  return matches;
}
