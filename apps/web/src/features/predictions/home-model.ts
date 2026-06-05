/**
 * Pure view-model helpers for the post-login /home predict hub. No I/O, no React —
 * unit-tested (`__tests__/home-model.ts`) so the "featured vs rest" split and the
 * recent-predictions selector are correct independent of the page that renders them.
 *
 * The home composes one HERO predict card (the soonest upcoming fixture) plus a
 * grid of the remaining fixtures, and a compact "Mis predicciones" strip of the
 * user's most recent calls. Both inputs arrive pre-sorted from `queries.ts`
 * (fixtures: kickoff asc; predictions: created_at desc).
 */

import type { PredictableFixture, UserPrediction } from './queries';

/** The hero fixture (first upcoming) plus the remaining fixtures for the grid. */
export interface FeaturedSplit {
  /** The soonest upcoming fixture — rendered as the big predict card. Null when none. */
  featured: PredictableFixture | null;
  /** Every fixture after the featured one, in kickoff order — the grid. */
  rest: PredictableFixture[];
}

/**
 * Split a kickoff-ascending fixture list into the hero (first) and the rest.
 * Pure + non-mutating: an empty list yields `{ featured: null, rest: [] }`.
 */
export function splitFeatured(fixtures: PredictableFixture[]): FeaturedSplit {
  const [featured = null, ...rest] = fixtures;
  return { featured, rest };
}

/**
 * The most recent `limit` predictions for the "Mis predicciones" strip. The input
 * is already newest-first (the query orders by `created_at` desc), so this just
 * caps the list. Non-positive limits yield `[]`. Pure + non-mutating.
 */
export function recentPredictions(predictions: UserPrediction[], limit: number): UserPrediction[] {
  if (limit <= 0) return [];
  return predictions.slice(0, limit);
}
