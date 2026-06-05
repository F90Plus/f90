/**
 * Predictions read-model: types, pure mappers, and DB-reading functions.
 *
 * Pure mappers (toPredictableFixture, toUserPrediction) are unit-tested.
 * DB functions (getPredictableFixtures, getUserPredictions) are typed but
 * not unit-tested live — they depend on RLS/Supabase context.
 *
 * Approach for getUserPredictions: two separate selects + an in-memory join.
 * Supabase relational selects (`*, fixtures(*)`) require PostgREST to detect
 * the FK relationship at schema-introspection time and work reliably with
 * generated type stubs — a two-select approach avoids that dependency and is
 * equally correct for the small result sets here (one user's predictions +
 * their fixture details). getPredictableFixtures uses the same two-select
 * pattern for consistency and simplicity.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { pointsForProbability } from '@/lib/scoring';
import type { Outcome } from './validation';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type OutcomeProb = {
  home: number;
  draw: number;
  away: number;
};

export type PredictableFixture = {
  id: string;
  groupLabel: string | null;
  round: string | null;
  kickoffISO: string;
  homeCode: string;
  awayCode: string;
  /** Model probabilities (0–1]. */
  prob: OutcomeProb;
  /** Points awarded per outcome if the user's pick is correct. */
  points: OutcomeProb;
  /** The outcome with the highest probability — the "favourite". */
  lean: Outcome;
  /** The authenticated user's current pick, or null if none / unauthenticated. */
  userPick: Outcome | null;
};

export type UserPrediction = {
  fixtureId: string;
  homeCode: string;
  awayCode: string;
  kickoffISO: string;
  pick: Outcome;
  pointsPossible: number;
  /** pending = before kickoff; locked = after kickoff, not settled; settled = result known. */
  status: 'pending' | 'locked' | 'settled';
  /** true/false once settled (awarded_points > 0); null before settlement. */
  correct: boolean | null;
  awardedPoints: number | null;
  awardedCoins: number | null;
  homeGoals: number | null;
  awayGoals: number | null;
};

// ---------------------------------------------------------------------------
// Internal DB row shapes (only the columns we consume)
// ---------------------------------------------------------------------------

interface FixtureRow {
  id: string;
  group_label: string | null;
  round: string | null;
  kickoff_at: string;
  home_code: string | null;
  away_code: string | null;
  home_goals: number | null;
  away_goals: number | null;
  prob_home: number | null;
  prob_draw: number | null;
  prob_away: number | null;
  status: string;
}

interface PredictionRow {
  id: number;
  user_id: string;
  fixture_id: string;
  kind: string;
  payload: { outcome: string };
  points_possible: number;
  settled_at: string | null;
  awarded_points: number | null;
  awarded_coins: number | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Safe pointsForProbability: treats null/0 prob as 0 points (no division). */
function safePoints(prob: number | null): number {
  if (prob == null || prob <= 0) return 0;
  return pointsForProbability(prob);
}

/** Return the Outcome key with the highest probability (treats null as 0). */
function argmaxOutcome(probHome: number | null, probDraw: number | null, probAway: number | null): Outcome {
  const h = probHome ?? 0;
  const d = probDraw ?? 0;
  const a = probAway ?? 0;
  if (h >= d && h >= a) return 'home';
  if (d >= a) return 'draw';
  return 'away';
}

// ---------------------------------------------------------------------------
// Pure mappers (exported for unit testing)
// ---------------------------------------------------------------------------

/**
 * Build a `PredictableFixture` from a fixture DB row and the user's current pick.
 * Guards null probabilities: returns points = 0 for that outcome, and lean from
 * whichever probs are available (null treated as 0 in argmax).
 */
export function toPredictableFixture(
  row: FixtureRow,
  userPick: Outcome | null,
): PredictableFixture {
  return {
    id: row.id,
    groupLabel: row.group_label,
    round: row.round,
    kickoffISO: row.kickoff_at,
    homeCode: row.home_code ?? '',
    awayCode: row.away_code ?? '',
    prob: {
      home: row.prob_home ?? 0,
      draw: row.prob_draw ?? 0,
      away: row.prob_away ?? 0,
    },
    points: {
      home: safePoints(row.prob_home),
      draw: safePoints(row.prob_draw),
      away: safePoints(row.prob_away),
    },
    lean: argmaxOutcome(row.prob_home, row.prob_draw, row.prob_away),
    userPick,
  };
}

/**
 * Build a `UserPrediction` from a prediction row + its fixture row.
 *
 * @param now Injected for testability — defaults to `new Date()` in production calls.
 *            The DB functions pass `new Date()` explicitly; tests inject a fixed value.
 */
export function toUserPrediction(
  pred: PredictionRow,
  fixture: FixtureRow,
  now: Date,
): UserPrediction {
  const isSettled = pred.settled_at != null;
  const kickoffPassed = new Date(fixture.kickoff_at) <= now;

  let status: UserPrediction['status'];
  if (isSettled) {
    status = 'settled';
  } else if (kickoffPassed) {
    status = 'locked';
  } else {
    status = 'pending';
  }

  const correct = isSettled
    ? (pred.awarded_points != null ? pred.awarded_points > 0 : false)
    : null;

  return {
    fixtureId: pred.fixture_id,
    homeCode: fixture.home_code ?? '',
    awayCode: fixture.away_code ?? '',
    kickoffISO: fixture.kickoff_at,
    pick: pred.payload.outcome as Outcome,
    pointsPossible: pred.points_possible,
    status,
    correct,
    awardedPoints: pred.awarded_points,
    awardedCoins: pred.awarded_coins,
    homeGoals: fixture.home_goals,
    awayGoals: fixture.away_goals,
  };
}

// ---------------------------------------------------------------------------
// DB-reading functions (typed; not unit-tested live — depend on RLS/Supabase)
// ---------------------------------------------------------------------------

/**
 * Fetch all upcoming fixtures with the authenticated user's existing picks merged
 * in. Uses two selects + in-memory merge (see file doc for rationale).
 *
 * - Fixtures: `kickoff_at > now()`, ordered ascending.
 * - User predictions: RLS filters to the caller's auth.uid() rows automatically.
 * - If unauthenticated, the predictions select returns an empty array (RLS);
 *   all fixtures are returned with `userPick: null`.
 */
export async function getPredictableFixtures(
  supabase: SupabaseClient,
): Promise<PredictableFixture[]> {
  const now = new Date().toISOString();

  // 1. Upcoming fixtures (public; world-readable via RLS)
  const { data: fixtures, error: fixturesErr } = await supabase
    .from('fixtures')
    .select('id,group_label,round,kickoff_at,home_code,away_code,home_goals,away_goals,prob_home,prob_draw,prob_away,status')
    .gt('kickoff_at', now)
    .order('kickoff_at', { ascending: true });

  if (fixturesErr) throw new Error(`getPredictableFixtures: ${fixturesErr.message}`);
  if (!fixtures || fixtures.length === 0) return [];

  // 2. The user's existing picks for these fixtures (RLS: own rows only)
  const fixtureIds = fixtures.map((f: FixtureRow) => f.id);
  const { data: preds } = await supabase
    .from('predictions')
    .select('fixture_id,payload')
    .in('fixture_id', fixtureIds)
    .eq('kind', 'match_result');

  // Build a fixtureId → Outcome map from the user's picks
  const pickMap = new Map<string, Outcome>();
  if (preds) {
    for (const p of preds as Array<{ fixture_id: string; payload: { outcome: string } }>) {
      pickMap.set(p.fixture_id, p.payload.outcome as Outcome);
    }
  }

  return (fixtures as FixtureRow[]).map((f) =>
    toPredictableFixture(f, pickMap.get(f.id) ?? null),
  );
}

/**
 * Fetch all of the authenticated user's predictions with fixture context merged
 * in. Uses two selects + in-memory join (see file doc for rationale).
 *
 * - Predictions: RLS filters to the caller's auth.uid() rows.
 * - Ordered by `created_at` descending (newest first).
 */
export async function getUserPredictions(
  supabase: SupabaseClient,
): Promise<UserPrediction[]> {
  const now = new Date();

  // 1. User's predictions, newest first (RLS: own rows only)
  const { data: preds, error: predsErr } = await supabase
    .from('predictions')
    .select('id,user_id,fixture_id,kind,payload,points_possible,settled_at,awarded_points,awarded_coins,created_at,updated_at')
    .eq('kind', 'match_result')
    .order('created_at', { ascending: false });

  if (predsErr) throw new Error(`getUserPredictions: ${predsErr.message}`);
  if (!preds || preds.length === 0) return [];

  // 2. Fetch the referenced fixtures in a single round-trip
  const fixtureIds = [...new Set((preds as PredictionRow[]).map((p) => p.fixture_id))];
  const { data: fixtures, error: fixturesErr } = await supabase
    .from('fixtures')
    .select('id,group_label,round,kickoff_at,home_code,away_code,home_goals,away_goals,prob_home,prob_draw,prob_away,status')
    .in('id', fixtureIds);

  if (fixturesErr) throw new Error(`getUserPredictions (fixtures): ${fixturesErr.message}`);

  const fixtureMap = new Map<string, FixtureRow>();
  for (const f of (fixtures ?? []) as FixtureRow[]) {
    fixtureMap.set(f.id, f);
  }

  const result: UserPrediction[] = [];
  for (const pred of preds as PredictionRow[]) {
    const fixture = fixtureMap.get(pred.fixture_id);
    if (!fixture) continue; // orphaned prediction — skip
    result.push(toUserPrediction(pred, fixture, now));
  }
  return result;
}
