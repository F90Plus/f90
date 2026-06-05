import { describe, expect, it } from 'vitest';
import { coinsForPoints, COINS_PER_POINT, pointsForProbability } from '../scoring';

describe('pointsForProbability — difficulty-honest scoring (TS twin of make_prediction SQL)', () => {
  it('underdog rewarded more than favourite', () => {
    expect(pointsForProbability(0.15)).toBeGreaterThan(pointsForProbability(0.6));
  });

  it('always returns a deterministic integer', () => {
    expect(Number.isInteger(pointsForProbability(0.33))).toBe(true);
  });

  it('prob 0.5 → 40 (round(20/0.5)=40, in range)', () => {
    expect(pointsForProbability(0.5)).toBe(40);
  });

  it('prob 0.6 → 33 (round(20/0.6)=33, in range)', () => {
    expect(pointsForProbability(0.6)).toBe(33);
  });

  it('prob 0.26 → 77 (round(20/0.26)=77, in range)', () => {
    expect(pointsForProbability(0.26)).toBe(77);
  });

  it('prob 0.99 → 20 (round(20/0.99)=20, in range)', () => {
    expect(pointsForProbability(0.99)).toBe(20);
  });

  it('clamp upper: prob 0.01 → 500 (round(20/0.01)=2000 → clamped to 500)', () => {
    expect(pointsForProbability(0.01)).toBe(500);
  });

  it('clamp upper: prob 0.0001 → 500 (extremely unlikely outcome → capped)', () => {
    expect(pointsForProbability(0.0001)).toBe(500);
  });

  it('clamp lower: prob 1 → 20 (certain outcome → floor is 20, above MIN 10)', () => {
    expect(pointsForProbability(1)).toBe(20);
  });

  it('clamp lower: prob 1 is always at least MIN_POINTS (10)', () => {
    expect(pointsForProbability(1)).toBeGreaterThanOrEqual(10);
  });
});

describe('coinsForPoints', () => {
  it('COINS_PER_POINT is 1 (1:1 parity with points)', () => {
    expect(COINS_PER_POINT).toBe(1);
  });

  it('coinsForPoints(40) === 40 (mirrors points at 1:1)', () => {
    expect(coinsForPoints(40)).toBe(40);
  });
});
