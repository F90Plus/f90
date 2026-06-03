import type { MatchInsight, Signal } from './model';
import { getOutcome } from './engine/util';

/** A renderable line: an i18n key + params. The UI feeds it to `t(key, params)`. */
export interface InsightLine {
  key: string;
  params?: Record<string, string | number>;
}

function leanTeamCode(insight: MatchInsight): string {
  if (insight.lean === 'home') return insight.home.code;
  if (insight.lean === 'away') return insight.away.code;
  return '';
}

/** The headline recommendation line. */
export function recommendationLine(insight: MatchInsight): InsightLine {
  const { probabilities, lean } = insight;
  const sorted = [probabilities.home, probabilities.draw, probabilities.away].sort((a, b) => b - a);
  const top = sorted[0] ?? 0;
  const second = sorted[1] ?? 0;
  if (top - second < 0.05) return { key: 'rec.tooClose' };
  return { key: `rec.${lean}`, params: { team: leanTeamCode(insight) } };
}

/** Confidence label key. */
export function confidenceLine(insight: MatchInsight): InsightLine {
  return { key: `confidence.${insight.confidenceBucket}` };
}

function driverLine(signal: Signal, insight: MatchInsight): InsightLine {
  const team = leanTeamCode(insight);
  const pct = Math.round(getOutcome(signal.triplet, insight.lean) * 100);
  const isHome = insight.lean === 'home';

  switch (signal.key) {
    case 'market':
      return { key: 'driver.market', params: { team, pct } };
    case 'elo':
      return { key: 'driver.elo', params: { team } };
    case 'form': {
      const wins = Number(isHome ? signal.detail.homeWins : signal.detail.awayWins) || 0;
      const n = Number(isHome ? signal.detail.homeN : signal.detail.awayN) || 0;
      return { key: 'driver.form', params: { team, wins, n } };
    }
    case 'quality':
      return { key: 'driver.quality', params: { team } };
    case 'external':
      return { key: 'driver.external', params: { team, pct } };
    case 'community':
      return { key: 'driver.community', params: { pct } };
    case 'h2h':
      return { key: 'driver.h2h', params: { team } };
    case 'home':
      return { key: 'driver.home', params: { team } };
    default:
      return { key: 'driver.even' };
  }
}

/** The 2–3 rationale bullets. Falls back to an "evenly balanced" line for draws. */
export function driverLines(insight: MatchInsight): InsightLine[] {
  if (insight.lean === 'draw' || insight.topDrivers.length === 0) {
    return [{ key: 'driver.even' }];
  }
  return insight.topDrivers.map((s) => driverLine(s, insight));
}

/** Optional value-vs-market note. */
export function valueLine(insight: MatchInsight): InsightLine | null {
  if (!insight.valueVsMarket) return null;
  const team =
    insight.valueVsMarket.outcome === 'home'
      ? insight.home.code
      : insight.valueVsMarket.outcome === 'away'
        ? insight.away.code
        : '';
  return { key: 'value', params: { team, pct: Math.abs(insight.valueVsMarket.deltaPct) } };
}
