/**
 * F90+ difficulty-honest scoring — the TypeScript twin of the authoritative SQL
 * in `make_prediction()` (migration 0004). The lower the model's probability of
 * the outcome you called correctly, the more points it is worth. Used for DISPLAY
 * ("points if you're right" on the predict card, P2-5); the DB RPC is the source
 * of truth at pick time.
 *
 * KEEP THIS FORMULA IN SYNC WITH THE SQL:
 *   least(greatest(round(20.0 / prob)::int, 10), 500)
 * i.e. clamp(round(20 / prob), 10, 500).
 */

const BASE = 20;
const MIN_POINTS = 10;
const MAX_POINTS = 500;

/** Tokens F90 awarded per scoring point (1:1 parity). */
export const COINS_PER_POINT = 1;

/**
 * Points a correct prediction at probability `prob` is worth.
 *
 * Formula: `clamp(round(BASE / prob), MIN_POINTS, MAX_POINTS)` — mirrors the SQL
 * `least(greatest(round(20.0 / prob)::int, 10), 500)` in `make_prediction()`.
 *
 * @param prob Model probability of the outcome (0, 1]. Values ≤ 0 are clamped to
 *             a safe minimum (0.0001) to avoid division by zero.
 */
export function pointsForProbability(prob: number): number {
  const p = Math.min(Math.max(prob, 0.0001), 1);
  return Math.min(Math.max(Math.round(BASE / p), MIN_POINTS), MAX_POINTS);
}

/**
 * Tokens F90 earned for a given points tally.
 *
 * @param points Score from `pointsForProbability`.
 */
export function coinsForPoints(points: number): number {
  return points * COINS_PER_POINT;
}
