/**
 * Pure, I/O-free settlement helpers — the TypeScript twin of the result logic in
 * the `settle_fixture()` SQL (migration 0005). Used by the admin settle route to
 * (a) decide a finished fixture's winning outcome and (b) read PLAYED scores out
 * of a raw openfootball match before writing them to the `fixtures` table.
 *
 * Authoritative settlement (the points/coins award) happens server-side in the
 * SECURITY DEFINER `settle_fixture()` RPC; these helpers only prepare the result
 * data and mirror the SQL's winner rule so the two never drift.
 */

import type { OFMatch } from '@/lib/football/openfootball';
import type { Outcome } from './validation';

/**
 * Winning outcome of a finished match from its goals.
 *
 * Mirrors the SQL CASE in `settle_fixture()` EXACTLY:
 *   home_goals > away_goals → 'home'
 *   home_goals < away_goals → 'away'
 *   else                    → 'draw'
 */
export function outcomeOf(homeGoals: number, awayGoals: number): Outcome {
  if (homeGoals > awayGoals) return 'home';
  if (homeGoals < awayGoals) return 'away';
  return 'draw';
}

/** A played match's final score, ready to write to fixtures.home_goals/away_goals. */
export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
}

/**
 * Read a PLAYED match's full-time result from a raw openfootball match.
 *
 * openfootball encodes the final score as `score.ft = [homeGoals, awayGoals]`
 * (confirmed against worldcup.json/2022). It is absent until the match is played,
 * and `ht`-only means the match is in progress — both yield `null`.
 *
 * Returns `null` (NOT a result) when:
 *   - there is no `score` block (the WC2026 schedule shape — match not played),
 *   - `score.ft` is missing (only `ht` present — match in progress), or
 *   - `score.ft` is malformed (not exactly two finite numbers).
 *
 * A `null` return means "do not finalize this fixture yet". The route only writes
 * `status='final'` for matches that return a non-null result here.
 */
export function resultFromMatch(match: OFMatch): MatchResult | null {
  const ft = match.score?.ft;
  if (!Array.isArray(ft) || ft.length !== 2) return null;

  const [home, away] = ft;
  if (typeof home !== 'number' || !Number.isFinite(home)) return null;
  if (typeof away !== 'number' || !Number.isFinite(away)) return null;

  return { homeGoals: home, awayGoals: away };
}
