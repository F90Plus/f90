import type { FixtureSignalsInput, FormInput, Signal } from '../model';
import { clamp, logistic, normalizeTriplet, poissonTriplet } from './util';

/**
 * Base reliability weights per signal type (calibrate against history later).
 * They don't need to sum to 1 — the blend is a weighted log-linear pool.
 */
export const BASE_WEIGHTS = {
  market: 0.3,
  elo: 0.22,
  form: 0.16,
  quality: 0.16,
  external: 0.08,
  community: 0.05,
  home: 0.05,
  h2h: 0.03,
} as const;

const LEAGUE_AVG_GOALS = 1.35;
const DRAW_BASE = 0.26;

function countWins(f: FormInput): number {
  return f.recent.filter((r) => r === 'W').length;
}

/** Recency-weighted form score in 0..1 (recent results weigh most). */
function formScore(f: FormInput): number {
  let score = 0;
  let wsum = 0;
  f.recent.forEach((r, idx) => {
    const w = Math.pow(0.85, idx);
    const pts = r === 'W' ? 1 : r === 'D' ? 0.5 : 0;
    score += w * pts;
    wsum += w;
  });
  return wsum > 0 ? score / wsum : 0.5;
}

function withDrawBase(eHome: number): { home: number; draw: number; away: number } {
  return {
    home: eHome * (1 - DRAW_BASE),
    draw: DRAW_BASE,
    away: (1 - eHome) * (1 - DRAW_BASE),
  };
}

/**
 * Build every available signal from a fixture's normalized input. Signals absent
 * from the input are simply skipped — the engine degrades gracefully.
 * `contribution` is filled in by the blend step.
 */
export function buildSignals(input: FixtureSignalsInput): Signal[] {
  const signals: Signal[] = [];
  const ha = input.homeAdvantage;

  // Market (de-vig) — strongest external estimate.
  if (input.market) {
    const ph = 1 / input.market.homeOdds;
    const pd = 1 / input.market.drawOdds;
    const pa = 1 / input.market.awayOdds;
    signals.push({
      key: 'market',
      triplet: normalizeTriplet({ home: ph, draw: pd, away: pa }),
      confidence: 0.9,
      weight: BASE_WEIGHTS.market,
      contribution: 0,
      detail: {},
    });
  }

  // Elo (we maintain it) + home/host advantage.
  if (input.elo) {
    const d = input.elo.home - input.elo.away + 70 * ha;
    const eHome = 1 / (1 + Math.pow(10, -d / 400));
    signals.push({
      key: 'elo',
      triplet: normalizeTriplet(withDrawBase(eHome)),
      confidence: 0.8,
      weight: BASE_WEIGHTS.elo,
      contribution: 0,
      detail: { gap: Math.round(input.elo.home - input.elo.away) },
    });
  }

  // Home / host advantage — only surfaced when significant (host nations).
  if (ha >= 0.3) {
    const eHome = 0.5 + 0.25 * clamp(ha);
    signals.push({
      key: 'home',
      triplet: normalizeTriplet(withDrawBase(eHome)),
      confidence: 0.6,
      weight: BASE_WEIGHTS.home,
      contribution: 0,
      detail: {},
    });
  }

  // Form — recency-weighted recent results.
  if (input.form) {
    const sh = formScore(input.form.home);
    const sa = formScore(input.form.away);
    const eHome = logistic(3 * (sh - sa) + 0.3 * ha);
    const n = Math.max(input.form.home.recent.length, input.form.away.recent.length);
    signals.push({
      key: 'form',
      triplet: normalizeTriplet(withDrawBase(eHome)),
      confidence: clamp(Math.min(n, 5) / 5) * 0.85,
      weight: BASE_WEIGHTS.form,
      contribution: 0,
      detail: {
        homeWins: countWins(input.form.home),
        homeN: input.form.home.recent.length,
        awayWins: countWins(input.form.away),
        awayN: input.form.away.recent.length,
      },
    });
  }

  // Quality / xG-proxy — Poisson over goal-rate-derived expected goals.
  if (input.form) {
    const outHome = input.availability?.homeKeyOut ?? 0;
    const outAway = input.availability?.awayKeyOut ?? 0;
    const attH = input.form.home.goalsFor / LEAGUE_AVG_GOALS;
    const attA = input.form.away.goalsFor / LEAGUE_AVG_GOALS;
    const defH = LEAGUE_AVG_GOALS / Math.max(input.form.home.goalsAgainst, 0.3);
    const defA = LEAGUE_AVG_GOALS / Math.max(input.form.away.goalsAgainst, 0.3);
    const lambdaHome = clamp(
      attH * defA * LEAGUE_AVG_GOALS * (1 + 0.12 * ha) * (1 - 0.05 * outHome),
      0.2,
      4.5,
    );
    const lambdaAway = clamp(attA * defH * LEAGUE_AVG_GOALS * (1 - 0.05 * outAway), 0.2, 4.5);
    signals.push({
      key: 'quality',
      triplet: poissonTriplet(lambdaHome, lambdaAway),
      confidence: 0.7,
      weight: BASE_WEIGHTS.quality,
      contribution: 0,
      detail: {
        lambdaHome: Math.round(lambdaHome * 100) / 100,
        lambdaAway: Math.round(lambdaAway * 100) / 100,
      },
    });
  }

  // External model prediction (e.g. API-Football).
  if (input.external) {
    signals.push({
      key: 'external',
      triplet: normalizeTriplet(input.external.triplet),
      confidence: 0.7,
      weight: BASE_WEIGHTS.external,
      contribution: 0,
      detail: {},
    });
  }

  // F90+ community consensus — weight scales with sample size.
  if (input.community) {
    const c = input.community;
    signals.push({
      key: 'community',
      triplet: normalizeTriplet({ home: c.homePct, draw: c.drawPct, away: c.awayPct }),
      confidence: clamp(c.sampleSize / 600) * 0.7,
      weight: BASE_WEIGHTS.community,
      contribution: 0,
      detail: { sampleSize: c.sampleSize },
    });
  }

  // Head-to-head — Laplace-smoothed, low confidence (small samples).
  if (input.h2h) {
    const { homeWins, draws, awayWins } = input.h2h;
    const total = homeWins + draws + awayWins;
    signals.push({
      key: 'h2h',
      triplet: normalizeTriplet({
        home: homeWins + 1,
        draw: draws + 1,
        away: awayWins + 1,
      }),
      confidence: total > 0 ? 0.35 : 0.1,
      weight: BASE_WEIGHTS.h2h,
      contribution: 0,
      detail: { total },
    });
  }

  return signals;
}
