import type { FixtureSignalsInput } from '../model';

/**
 * Cached, normalized signal snapshots for the homepage fixtures. In production
 * these are written by the ingestion layer (see AI_COPILOT_ARCHITECTURE_V1.md);
 * here they stand in so the engine is fully functional at $0, offline.
 * `fetchedAt` is fixed for deterministic, hydration-safe rendering.
 */
const FETCHED_AT = '2026-06-03T12:00:00Z';

export const MOCK_FIXTURE_SIGNALS: Record<string, FixtureSignalsInput> = {
  'esp-bra': {
    fixtureId: 'esp-bra',
    home: { code: 'ESP', name: 'Spain' },
    away: { code: 'BRA', name: 'Brazil' },
    homeAdvantage: 0.3,
    form: {
      home: { recent: ['W', 'W', 'D', 'W', 'W'], goalsFor: 2.2, goalsAgainst: 0.8 },
      away: { recent: ['W', 'L', 'W', 'D', 'W'], goalsFor: 1.8, goalsAgainst: 1.0 },
    },
    elo: { home: 2050, away: 2010 },
    market: { homeOdds: 1.95, drawOdds: 3.6, awayOdds: 3.9 },
    h2h: { homeWins: 2, draws: 2, awayWins: 1 },
    external: { triplet: { home: 0.5, draw: 0.26, away: 0.24 } },
    community: { homePct: 71, drawPct: 16, awayPct: 13, sampleSize: 1240 },
    availability: { homeKeyOut: 0, awayKeyOut: 1 },
    source: 'mock',
    fetchedAt: FETCHED_AT,
  },
  'arg-fra': {
    fixtureId: 'arg-fra',
    home: { code: 'ARG', name: 'Argentina' },
    away: { code: 'FRA', name: 'France' },
    homeAdvantage: 0.25,
    form: {
      home: { recent: ['W', 'W', 'W', 'D', 'L'], goalsFor: 2.0, goalsAgainst: 1.0 },
      away: { recent: ['W', 'D', 'W', 'W', 'L'], goalsFor: 1.9, goalsAgainst: 1.1 },
    },
    elo: { home: 2060, away: 2040 },
    market: { homeOdds: 2.1, drawOdds: 3.4, awayOdds: 3.5 },
    h2h: { homeWins: 2, draws: 1, awayWins: 2 },
    external: { triplet: { home: 0.41, draw: 0.27, away: 0.32 } },
    community: { homePct: 55, drawPct: 24, awayPct: 21, sampleSize: 980 },
    availability: { homeKeyOut: 0, awayKeyOut: 0 },
    source: 'mock',
    fetchedAt: FETCHED_AT,
  },
  'ger-ned': {
    fixtureId: 'ger-ned',
    home: { code: 'GER', name: 'Germany' },
    away: { code: 'NED', name: 'Netherlands' },
    homeAdvantage: 0.2,
    form: {
      home: { recent: ['W', 'L', 'D', 'W', 'L'], goalsFor: 1.7, goalsAgainst: 1.3 },
      away: { recent: ['W', 'W', 'D', 'L', 'W'], goalsFor: 1.8, goalsAgainst: 1.2 },
    },
    elo: { home: 1980, away: 1975 },
    market: { homeOdds: 2.4, drawOdds: 3.3, awayOdds: 2.9 },
    h2h: { homeWins: 2, draws: 1, awayWins: 2 },
    external: { triplet: { home: 0.38, draw: 0.29, away: 0.33 } },
    community: { homePct: 38, drawPct: 29, awayPct: 33, sampleSize: 760 },
    availability: { homeKeyOut: 1, awayKeyOut: 0 },
    source: 'mock',
    fetchedAt: FETCHED_AT,
  },
  'por-mex': {
    fixtureId: 'por-mex',
    home: { code: 'POR', name: 'Portugal' },
    away: { code: 'MEX', name: 'Mexico' },
    homeAdvantage: 0.2,
    form: {
      home: { recent: ['W', 'W', 'W', 'D', 'W'], goalsFor: 2.1, goalsAgainst: 0.9 },
      away: { recent: ['W', 'D', 'L', 'W', 'D'], goalsFor: 1.4, goalsAgainst: 1.2 },
    },
    elo: { home: 2000, away: 1900 },
    market: { homeOdds: 1.8, drawOdds: 3.5, awayOdds: 4.4 },
    h2h: { homeWins: 3, draws: 1, awayWins: 1 },
    external: { triplet: { home: 0.46, draw: 0.27, away: 0.27 } },
    community: { homePct: 64, drawPct: 20, awayPct: 16, sampleSize: 870 },
    availability: { homeKeyOut: 0, awayKeyOut: 1 },
    source: 'mock',
    fetchedAt: FETCHED_AT,
  },
  'usa-jpn': {
    fixtureId: 'usa-jpn',
    home: { code: 'USA', name: 'United States' },
    away: { code: 'JPN', name: 'Japan' },
    homeAdvantage: 0.4,
    form: {
      home: { recent: ['W', 'D', 'L', 'W', 'D'], goalsFor: 1.5, goalsAgainst: 1.3 },
      away: { recent: ['W', 'W', 'D', 'W', 'L'], goalsFor: 1.9, goalsAgainst: 1.0 },
    },
    elo: { home: 1880, away: 1910 },
    market: { homeOdds: 2.5, drawOdds: 3.2, awayOdds: 2.8 },
    h2h: { homeWins: 1, draws: 2, awayWins: 2 },
    external: { triplet: { home: 0.37, draw: 0.3, away: 0.33 } },
    community: { homePct: 42, drawPct: 30, awayPct: 28, sampleSize: 540 },
    availability: { homeKeyOut: 0, awayKeyOut: 0 },
    source: 'mock',
    fetchedAt: FETCHED_AT,
  },
};
