import type { CopilotSource } from './types';
import type { FixtureSignalsInput, FormInput, ResultChar } from '../model';

/**
 * football-data.org adapter (REAL implementation, env-gated).
 *
 * Free forever, World Cup + top leagues. Activates only when
 * `COPILOT_SOURCE=live` AND `FOOTBALL_DATA_API_KEY` is set — otherwise the Copilot
 * runs on the mock source. Requests are cached (`revalidate`) to respect the free
 * tier (10 req/min). Fixture→id mapping is intentionally empty until we wire real
 * fixtures; until then this source returns null and the mock fallback serves.
 *
 * Docs: https://docs.football-data.org/general/v4/ — auth header: X-Auth-Token.
 */
const BASE = 'https://api.football-data.org/v4';

function apiKey(): string {
  return process.env.FOOTBALL_DATA_API_KEY ?? '';
}

function liveEnabled(): boolean {
  return process.env.COPILOT_SOURCE === 'live' && apiKey() !== '';
}

interface FdMatch {
  status: string;
  utcDate: string;
  homeTeam: { id: number };
  awayTeam: { id: number };
  score: { fullTime: { home: number | null; away: number | null } };
}

async function fdFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': apiKey() },
    // Cache-first: re-use responses for an hour to stay within the free tier.
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`football-data ${res.status}`);
  return res.json() as Promise<T>;
}

/** Map a team's recent finished matches → FormInput (most-recent-first). */
export function mapForm(matches: FdMatch[], teamId: number, n = 5): FormInput {
  const finished = matches
    .filter((m) => m.status === 'FINISHED' && m.score.fullTime.home !== null)
    .sort((a, b) => b.utcDate.localeCompare(a.utcDate))
    .slice(0, n);

  const recent: ResultChar[] = [];
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const m of finished) {
    const isHome = m.homeTeam.id === teamId;
    const fh = m.score.fullTime.home ?? 0;
    const fa = m.score.fullTime.away ?? 0;
    const scored = isHome ? fh : fa;
    const conceded = isHome ? fa : fh;
    goalsFor += scored;
    goalsAgainst += conceded;
    recent.push(scored > conceded ? 'W' : scored < conceded ? 'L' : 'D');
  }

  const count = finished.length || 1;
  return {
    recent,
    goalsFor: Math.round((goalsFor / count) * 10) / 10,
    goalsAgainst: Math.round((goalsAgainst / count) * 10) / 10,
  };
}

/** Fixture slug → football-data team ids. Empty until real fixtures are wired. */
const FIXTURE_MAP: Record<string, { homeTeamId: number; awayTeamId: number }> = {};

export const footballDataSource: CopilotSource = {
  id: 'football-data',
  isEnabled: () => liveEnabled(),

  async getFixtureSignals(fixtureId): Promise<FixtureSignalsInput | null> {
    const ids = FIXTURE_MAP[fixtureId];
    if (!ids) return null; // not mapped yet → let the next source handle it

    const [homeMatches, awayMatches] = await Promise.all([
      fdFetch<{ matches: FdMatch[] }>(`/teams/${ids.homeTeamId}/matches?status=FINISHED&limit=8`),
      fdFetch<{ matches: FdMatch[] }>(`/teams/${ids.awayTeamId}/matches?status=FINISHED&limit=8`),
    ]);

    return {
      fixtureId,
      home: { code: '', name: '' },
      away: { code: '', name: '' },
      homeAdvantage: 0.25,
      form: {
        home: mapForm(homeMatches.matches, ids.homeTeamId),
        away: mapForm(awayMatches.matches, ids.awayTeamId),
      },
      // football-data does not provide odds/community; those come from other sources.
      source: 'football-data',
      fetchedAt: new Date().toISOString(),
    };
  },
};
