import { analyzeFixture } from './engine';
import { getFixtureSignals } from './sources';
import { MOCK_FIXTURE_SIGNALS } from './sources/mock-data';
import type { FixtureSignalsInput, MatchInsight, TeamRef } from './model';

export type { MatchInsight, Signal, Outcome, ProbTriplet } from './model';
export {
  recommendationLine,
  confidenceLine,
  driverLines,
  valueLine,
  type InsightLine,
} from './insights';

/**
 * The Copilot facade: resolve a fixture's data (cache-first, mock fallback) and
 * run the deterministic engine. Returns null if no source can serve the fixture.
 */
export async function getMatchInsight(fixtureId: string): Promise<MatchInsight | null> {
  const input = await getFixtureSignals(fixtureId);
  return input ? analyzeFixture(input) : null;
}

/**
 * Synchronous, mock-only insight — for static rendering without a Suspense
 * boundary. The live (async) path above is used once real sources are enabled.
 */
export function getMatchInsightSync(fixtureId: string): MatchInsight | null {
  const input = MOCK_FIXTURE_SIGNALS[fixtureId];
  return input ? analyzeFixture(input) : null;
}

/**
 * Build an insight for a REAL fixture from team strengths only (elo + host
 * advantage). Market/form/community signals are absent until live sources connect,
 * so the engine degrades gracefully (honest lower confidence). This is the path
 * the homepage Analyst uses on real openfootball fixtures.
 */
export function insightFromStrengths(args: {
  fixtureId: string;
  home: TeamRef;
  away: TeamRef;
  homeStrength: number;
  awayStrength: number;
  homeAdvantage: number;
}): MatchInsight {
  const input: FixtureSignalsInput = {
    fixtureId: args.fixtureId,
    home: args.home,
    away: args.away,
    homeAdvantage: args.homeAdvantage,
    elo: { home: args.homeStrength, away: args.awayStrength },
    source: 'model',
    fetchedAt: '2026-06-03T12:00:00Z',
  };
  return analyzeFixture(input);
}
