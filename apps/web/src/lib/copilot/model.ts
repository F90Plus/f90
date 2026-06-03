/**
 * F90+ Copilot — internal data model.
 *
 * One normalized shape that every data source maps into and the engine consumes.
 * Heterogeneous providers (football-data.org, API-Football, The Odds API, our own
 * community) all become a `FixtureSignalsInput`; the engine turns that into a
 * `MatchInsight`. See docs/PREDICTION_ENGINE_V1.md.
 */

export type Outcome = 'home' | 'draw' | 'away';

/** A probability distribution over the three outcomes. Should sum to ~1. */
export interface ProbTriplet {
  home: number;
  draw: number;
  away: number;
}

export interface TeamRef {
  code: string;
  name: string;
}

export type ResultChar = 'W' | 'D' | 'L';

/** Recent performance for one team. `recent` is most-recent-first. */
export interface FormInput {
  recent: ResultChar[];
  /** Avg goals scored / conceded per match (recent or season). */
  goalsFor: number;
  goalsAgainst: number;
}

/** Internal Elo ratings (we maintain these ourselves — no external dependency). */
export interface EloInput {
  home: number;
  away: number;
}

/** Bookmaker decimal odds (still include the vig; the engine de-vigs them). */
export interface MarketInput {
  homeOdds: number;
  drawOdds: number;
  awayOdds: number;
}

/** Recent head-to-head meeting counts. */
export interface H2HInput {
  homeWins: number;
  draws: number;
  awayWins: number;
}

/** An external model's prediction (e.g. API-Football `/predictions`). */
export interface ExternalPredictionInput {
  triplet: ProbTriplet;
}

/** F90+'s own community: percentage of users picking each outcome. */
export interface CommunityInput {
  homePct: number;
  drawPct: number;
  awayPct: number;
  sampleSize: number;
}

/** Count of key players unavailable (injuries/suspensions). */
export interface AvailabilityInput {
  homeKeyOut: number;
  awayKeyOut: number;
}

/** Everything the engine needs to analyze one fixture. */
export interface FixtureSignalsInput {
  fixtureId: string;
  home: TeamRef;
  away: TeamRef;
  /** Home/host advantage in 0..1 (0 = neutral venue, 1 = strong home). */
  homeAdvantage: number;
  form?: { home: FormInput; away: FormInput };
  elo?: EloInput;
  market?: MarketInput;
  h2h?: H2HInput;
  external?: ExternalPredictionInput;
  community?: CommunityInput;
  availability?: AvailabilityInput;
  /** Provenance + freshness. */
  source: string;
  fetchedAt: string;
}

export type SignalKey =
  | 'market'
  | 'elo'
  | 'form'
  | 'quality'
  | 'external'
  | 'community'
  | 'h2h'
  | 'home';

/** One computed signal, normalized to a comparable probability triplet. */
export interface Signal {
  key: SignalKey;
  triplet: ProbTriplet;
  /** How trustworthy this signal is for this fixture (0..1). */
  confidence: number;
  /** Base reliability weight of this signal type. */
  weight: number;
  /** Effective contribution to the final blend (weight × confidence). */
  contribution: number;
  /** Structured detail for templated, i18n insight copy (no display strings here). */
  detail: Record<string, number | string>;
}

export type ConfidenceBucket = 'low' | 'moderate' | 'solid' | 'high';

/** The engine's output for a fixture — the Analyst's read. */
export interface MatchInsight {
  fixtureId: string;
  home: TeamRef;
  away: TeamRef;
  probabilities: ProbTriplet;
  lean: Outcome;
  confidence: number;
  confidenceBucket: ConfidenceBucket;
  /** All signals, sorted by contribution (desc). */
  signals: Signal[];
  /** The 2–3 signals that most supported the lean (for the rationale). */
  topDrivers: Signal[];
  /** Set when our probability for the lean diverges notably from the market. */
  valueVsMarket?: { outcome: Outcome; deltaPct: number };
  generatedAt: string;
}
