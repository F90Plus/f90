/**
 * Pure view-model helpers for the predict card. No I/O, no React — unit-tested
 * (`__tests__/card-model.ts`) so the consensus/contrarian framing and the ticket
 * geometry are correct independent of the components that render them.
 *
 * Vocabulary law (D-037): probabilidad / posición / participantes. Never odds,
 * stake, bet, or wager — `stance` is "you vs El Analista", not a wager.
 */

import { coinsForPoints } from '@/lib/scoring';
import type { OutcomeProb, PredictableFixture } from './queries';
import type { Outcome } from './validation';

/** Where the user stands relative to El Analista's read. */
export type Stance = 'consensus' | 'contrarian';

/** Everything the position ticket needs, derived from a fixture + the user's pick. */
export interface TicketView {
  pick: Outcome;
  stance: Stance;
  /** Points awarded if the pick is correct (display twin of the SQL at pick time). */
  points: number;
  /** Tokens F90 awarded if correct (1:1 with points). */
  coins: number;
  /** Position of the "TÚ" marker on the read bar, as a percentage [0..100]. */
  readMarkerPct: number;
}

/**
 * Consensus when the pick agrees with El Analista's lean; contrarian when it
 * challenges it (the higher-reward, gold-accented side).
 */
export function stanceOf(pick: Outcome, lean: Outcome): Stance {
  return pick === lean ? 'consensus' : 'contrarian';
}

/**
 * The "TÚ" marker sits at the CENTRE of the picked outcome's segment on the
 * home|draw|away read bar. Probabilities are normalised to percentages first
 * (so a set that doesn't sum to exactly 1 still maps onto a full-width bar),
 * then clamped to [0..100]. Degenerate all-zero input returns 0 (never NaN).
 */
export function readMarkerPct(prob: OutcomeProb, pick: Outcome): number {
  const total = prob.home + prob.draw + prob.away;
  if (total <= 0) return 0;

  const h = (prob.home / total) * 100;
  const d = (prob.draw / total) * 100;
  const a = (prob.away / total) * 100;

  let centre: number;
  switch (pick) {
    case 'home':
      centre = h / 2;
      break;
    case 'draw':
      centre = h + d / 2;
      break;
    case 'away':
      centre = h + d + a / 2;
      break;
  }

  return Math.min(Math.max(centre, 0), 100);
}

/**
 * Derive the full position-ticket view for a chosen outcome. `points` come from
 * the fixture (already computed via `pointsForProbability`, the display twin of
 * the authoritative `make_prediction()` SQL); `coins` mirror them 1:1.
 */
export function ticketView(fixture: PredictableFixture, pick: Outcome): TicketView {
  const points = fixture.points[pick];
  return {
    pick,
    stance: stanceOf(pick, fixture.lean),
    points,
    coins: coinsForPoints(points),
    readMarkerPct: readMarkerPct(fixture.prob, pick),
  };
}
