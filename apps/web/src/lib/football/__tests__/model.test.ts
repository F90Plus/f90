import { describe, expect, it } from 'vitest';
import { homeAdvantageFor, modelProbability } from '../model';

describe('modelProbability', () => {
  it('returns a normalized distribution (sums to 1)', () => {
    const p = modelProbability(1800, 1700, 0.2);
    expect(p.home + p.draw + p.away).toBeCloseTo(1, 6);
  });

  it('favours the stronger side at a neutral venue', () => {
    const p = modelProbability(2000, 1500, 0);
    expect(p.home).toBeGreaterThan(p.away);
  });

  it('is symmetric at equal strength and neutral venue', () => {
    const p = modelProbability(1800, 1800, 0);
    expect(p.home).toBeCloseTo(p.away, 6);
  });

  it('home advantage increases the home side', () => {
    const neutral = modelProbability(1800, 1800, 0);
    const withHa = modelProbability(1800, 1800, 0.4);
    expect(withHa.home).toBeGreaterThan(neutral.home);
  });
});

describe('homeAdvantageFor', () => {
  it('gives the three hosts a real bump', () => {
    expect(homeAdvantageFor('Mexico')).toBe(0.4);
    expect(homeAdvantageFor('USA')).toBe(0.4);
    expect(homeAdvantageFor('Canada')).toBe(0.4);
  });

  it('treats every other nation as near-neutral', () => {
    expect(homeAdvantageFor('Brazil')).toBe(0.05);
    expect(homeAdvantageFor('Spain')).toBe(0.05);
  });
});
