import { describe, expect, it } from 'vitest';
import { analyzeFixture } from '../index';
import type { FixtureSignalsInput } from '../../model';

/** Minimal fixture with no signals — the graceful-degradation baseline. */
const base: FixtureSignalsInput = {
  fixtureId: 'test-fixture',
  home: { code: 'AAA', name: 'Alpha' },
  away: { code: 'BBB', name: 'Beta' },
  homeAdvantage: 0,
  source: 'test',
  fetchedAt: '2026-01-01T00:00:00.000Z',
};

describe('analyzeFixture', () => {
  it('always returns a normalized probability triplet', () => {
    const i = analyzeFixture({ ...base, elo: { home: 1900, away: 1700 } });
    expect(i.probabilities.home + i.probabilities.draw + i.probabilities.away).toBeCloseTo(1, 6);
  });

  it('degrades to an even split with no signals (low confidence)', () => {
    const i = analyzeFixture(base);
    expect(i.probabilities.home).toBeCloseTo(1 / 3, 6);
    expect(i.probabilities.draw).toBeCloseTo(1 / 3, 6);
    expect(i.probabilities.away).toBeCloseTo(1 / 3, 6);
    expect(i.confidenceBucket).toBe('low');
  });

  it('leans toward the side the signals favour', () => {
    const i = analyzeFixture({ ...base, elo: { home: 2050, away: 1550 } });
    expect(i.lean).toBe('home');
  });

  it('grows more confident as more (agreeing) signals are present', () => {
    const eloOnly = analyzeFixture({ ...base, elo: { home: 2000, away: 1500 } });
    const richer = analyzeFixture({
      ...base,
      elo: { home: 2000, away: 1500 },
      market: { homeOdds: 1.3, drawOdds: 5, awayOdds: 9 },
      community: { homePct: 0.7, drawPct: 0.2, awayPct: 0.1, sampleSize: 600 },
    });
    expect(richer.confidence).toBeGreaterThan(eloOnly.confidence);
  });
});
