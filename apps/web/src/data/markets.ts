/**
 * Illustrative prediction-market tape + board for the homepage. F90+'s real
 * markets engine (D-034 vision) is not built yet, so these are a PREVIEW — the
 * UI signals "soon". (The rankings board reads real standings via `lib/rankings.ts`,
 * empty until Phase 2 scoring — the markets tape is the last illustrative surface.)
 *
 * Values are implied probabilities (Polymarket-style), NOT bookmaker odds —
 * F90+ is a prediction market, not a sportsbook (D-037, locked). `subject` names
 * are facts (real teams/players, D-025); `q` is an i18n key resolved at render
 * time. `spark` is the recent probability history (ends at `chance`) and
 * `predictors` is the F90+ crowd size — together they make a market read as a
 * living, collectively-priced market rather than a static stat.
 */

export type MarketDirection = 'up' | 'down';

export interface Market {
  /** Real team or player name — rendered verbatim (a fact, not licensed IP). */
  subject: string;
  /** Key under the `markets.q.*` i18n namespace (the outcome being priced). */
  q:
    | 'winner'
    | 'topScorer'
    | 'semifinalist'
    | 'groupWinner'
    | 'reachFinal'
    | 'last16'
    | 'goldenBall'
    | 'debutChampion';
  /** Optional phrasing param (e.g. the group letter for `groupWinner`). */
  param?: string;
  /** Token accent (hex) — a real nation colour where the subject is a team/player. */
  accent: string;
  /** Implied probability of the outcome, 0–100. */
  chance: number;
  /** Move over the last 24h, signed relative %. Sign drives colour + arrow. */
  delta: number;
  /** Recent probability history (oldest → newest). The last point equals `chance`. */
  spark: number[];
  /** Illustrative count of F90+ participants in this market (collective intelligence). */
  predictors: number;
  /** The single market the Analyst flags as a detected opportunity. */
  featured?: boolean;
  /** Points the Analyst's read sits above the market consensus (the conviction edge).
   *  Only positive edges are surfaced as a conviction line on the card. */
  edge?: number;
}

export const markets: Market[] = [
  {
    subject: 'España',
    q: 'winner',
    accent: '#E63946',
    chance: 24,
    delta: 8.2,
    spark: [15, 16, 18, 17, 20, 21, 23, 24],
    predictors: 4820,
    featured: true,
    edge: 6,
  },
  { subject: 'Mbappé', q: 'topScorer', accent: '#3D74FF', chance: 18, delta: 6.4, spark: [12, 13, 13, 15, 16, 16, 17, 18], predictors: 3110, edge: 4 },
  { subject: 'Argentina', q: 'semifinalist', accent: '#74ACE6', chance: 41, delta: 5.1, spark: [35, 36, 38, 37, 39, 40, 40, 41], predictors: 5640, edge: 3 },
  { subject: 'Brasil', q: 'groupWinner', param: 'G', accent: '#EFC400', chance: 63, delta: 3.7, spark: [58, 59, 60, 61, 60, 62, 62, 63], predictors: 2980, edge: 2 },
  { subject: 'France', q: 'winner', accent: '#3D74FF', chance: 21, delta: -2.4, spark: [25, 24, 24, 23, 22, 22, 21, 21], predictors: 2210 },
  { subject: 'England', q: 'reachFinal', accent: '#5B8CFF', chance: 16, delta: 1.9, spark: [13, 14, 14, 15, 15, 15, 16, 16], predictors: 1870, edge: 1 },
  { subject: 'Haaland', q: 'topScorer', accent: '#C8102E', chance: 12, delta: -1.3, spark: [14, 14, 13, 13, 13, 12, 12, 12], predictors: 1640 },
  { subject: 'USA', q: 'last16', accent: '#5B8CFF', chance: 58, delta: 2.6, spark: [54, 55, 55, 56, 57, 57, 58, 58], predictors: 3450, edge: 2 },
  { subject: 'Vinícius Jr', q: 'goldenBall', accent: '#EFC400', chance: 15, delta: 4.0, spark: [11, 12, 12, 13, 14, 14, 15, 15], predictors: 1990, edge: 3 },
  { subject: 'Mundial 2026', q: 'debutChampion', accent: '#aef23a', chance: 12, delta: -1.7, spark: [14, 14, 13, 13, 13, 13, 12, 12], predictors: 1430 },
];

/** Direction helper — keeps the sign convention in one place. */
export function marketDirection(delta: number): MarketDirection {
  return delta >= 0 ? 'up' : 'down';
}

/**
 * Build an SVG polyline `points` string for a sparkline. X is evenly spaced
 * across `width`; Y is the value normalised into `[pad, height - pad]` and
 * **inverted** (a higher value sits higher on screen). A flat series rests at the
 * vertical centre. Pure + deterministic so it can render on the server.
 */
export function sparkPath(values: number[], width: number, height: number, pad = 1): string {
  const n = values.length;
  if (n === 0) return '';

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  const innerH = height - pad * 2;
  const midY = height / 2;

  return values
    .map((v, i) => {
      const x = n === 1 ? width / 2 : (i / (n - 1)) * width;
      const y = span === 0 ? midY : pad + innerH * (1 - (v - min) / span);
      // round to 2dp to keep the markup tidy and stable across runs
      const rx = Math.round(x * 100) / 100;
      const ry = Math.round(y * 100) / 100;
      return `${rx},${ry}`;
    })
    .join(' ');
}
