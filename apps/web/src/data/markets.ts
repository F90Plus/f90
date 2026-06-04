/**
 * Illustrative prediction-market tape for the homepage ticker. F90+'s real
 * markets engine (D-034 vision) is not built yet, so these are a PREVIEW — the
 * UI signals "soon", the same way `data/leaderboard.ts` teases real standings.
 *
 * Values are implied probabilities (Polymarket-style), NOT bookmaker odds —
 * F90+ is a prediction market, not a sportsbook. `subject` names are facts
 * (real teams/players, D-025); `q` is an i18n key resolved at render time.
 */

export type MarketDirection = 'up' | 'down';

export interface Market {
  /** Real team or player name — rendered verbatim (a fact, not licensed IP). */
  subject: string;
  /** Key under the `markets.q.*` i18n namespace (the outcome being priced). */
  q: 'winner' | 'topScorer' | 'semifinalist' | 'groupWinner' | 'reachFinal' | 'last16' | 'goldenBall';
  /** Optional phrasing param (e.g. the group letter for `groupWinner`). */
  param?: string;
  /** Implied probability of the outcome, 0–100. */
  chance: number;
  /** Move over the last 24h, signed relative %. Sign drives colour + arrow. */
  delta: number;
}

export const markets: Market[] = [
  { subject: 'España', q: 'winner', chance: 24, delta: 8.2 },
  { subject: 'Mbappé', q: 'topScorer', chance: 18, delta: 6.4 },
  { subject: 'Argentina', q: 'semifinalist', chance: 41, delta: 5.1 },
  { subject: 'Brasil', q: 'groupWinner', param: 'G', chance: 63, delta: 3.7 },
  { subject: 'France', q: 'winner', chance: 21, delta: -2.4 },
  { subject: 'England', q: 'reachFinal', chance: 16, delta: 1.9 },
  { subject: 'Haaland', q: 'topScorer', chance: 12, delta: -1.3 },
  { subject: 'USA', q: 'last16', chance: 58, delta: 2.6 },
  { subject: 'Vinícius Jr', q: 'goldenBall', chance: 15, delta: 4.0 },
];

/** Direction helper — keeps the sign convention in one place. */
export function marketDirection(delta: number): MarketDirection {
  return delta >= 0 ? 'up' : 'down';
}
