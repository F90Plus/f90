import type {
  ConfidenceBucket,
  FixtureSignalsInput,
  MatchInsight,
  ProbTriplet,
} from '../model';
import { argmaxOutcome, clamp, EPS, getOutcome, normalizeTriplet } from './util';
import { BASE_WEIGHTS, buildSignals } from './signals';

const TOTAL_WEIGHT = Object.values(BASE_WEIGHTS).reduce((a, b) => a + b, 0);

function toBucket(c: number): ConfidenceBucket {
  if (c < 0.4) return 'low';
  if (c < 0.6) return 'moderate';
  if (c < 0.78) return 'solid';
  return 'high';
}

/**
 * The deterministic core: normalized signals → blended probabilities, a lean,
 * a confidence level, the supporting drivers, and a value-vs-market note.
 * Pure function — same input always yields the same insight.
 */
export function analyzeFixture(input: FixtureSignalsInput): MatchInsight {
  const signals = buildSignals(input);
  for (const s of signals) s.contribution = s.weight * s.confidence;

  // Weighted log-linear (geometric) pool of the signal triplets.
  let lh = 0;
  let ld = 0;
  let la = 0;
  let wsum = 0;
  for (const s of signals) {
    const w = s.contribution;
    lh += w * Math.log(Math.max(s.triplet.home, EPS));
    ld += w * Math.log(Math.max(s.triplet.draw, EPS));
    la += w * Math.log(Math.max(s.triplet.away, EPS));
    wsum += w;
  }
  const probabilities: ProbTriplet =
    wsum <= 0
      ? { home: 1 / 3, draw: 1 / 3, away: 1 / 3 }
      : normalizeTriplet({
          home: Math.exp(lh / wsum),
          draw: Math.exp(ld / wsum),
          away: Math.exp(la / wsum),
        });

  const lean = argmaxOutcome(probabilities);
  const finalLean = getOutcome(probabilities, lean);

  // Confidence = how complete the data was + how much the signals agree.
  const presentWeight = signals.reduce((a, s) => a + s.weight, 0);
  const completeness = clamp(presentWeight / TOTAL_WEIGHT);

  let varNum = 0;
  let varDen = 0;
  for (const s of signals) {
    const d = getOutcome(s.triplet, lean) - finalLean;
    varNum += s.contribution * d * d;
    varDen += s.contribution;
  }
  const dispersion = varDen > 0 ? Math.sqrt(varNum / varDen) : 0.5;
  const agreement = clamp(1 - dispersion / 0.5);
  const confidence = clamp(0.5 * agreement + 0.5 * completeness);

  // Drivers: the signals that most supported the lean.
  const topDrivers = signals
    .filter((s) => getOutcome(s.triplet, lean) >= 1 / 3)
    .sort(
      (a, b) =>
        b.contribution * getOutcome(b.triplet, lean) -
        a.contribution * getOutcome(a.triplet, lean),
    )
    .slice(0, 3);

  // Value vs the market (educational, never betting advice).
  let valueVsMarket: MatchInsight['valueVsMarket'];
  const market = signals.find((s) => s.key === 'market');
  if (market) {
    const delta = finalLean - getOutcome(market.triplet, lean);
    if (Math.abs(delta) >= 0.06) {
      valueVsMarket = { outcome: lean, deltaPct: Math.round(delta * 100) };
    }
  }

  return {
    fixtureId: input.fixtureId,
    home: input.home,
    away: input.away,
    probabilities,
    lean,
    confidence,
    confidenceBucket: toBucket(confidence),
    signals: [...signals].sort((a, b) => b.contribution - a.contribution),
    topDrivers,
    valueVsMarket,
    generatedAt: input.fetchedAt,
  };
}
