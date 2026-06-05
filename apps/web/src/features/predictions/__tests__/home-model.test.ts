import { describe, expect, it } from 'vitest';
import { splitFeatured, recentPredictions } from '../home-model';
import type { PredictableFixture, UserPrediction } from '../queries';

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

function fixture(id: string): PredictableFixture {
  return {
    id,
    groupLabel: 'Group A',
    round: 'Group Stage',
    kickoffISO: '2026-06-11T18:00:00Z',
    homeCode: 'MEX',
    awayCode: 'RSA',
    prob: { home: 0.5, draw: 0.3, away: 0.2 },
    points: { home: 40, draw: 67, away: 100 },
    lean: 'home',
    userPick: null,
  };
}

function prediction(fixtureId: string): UserPrediction {
  return {
    fixtureId,
    homeCode: 'MEX',
    awayCode: 'RSA',
    kickoffISO: '2026-06-11T18:00:00Z',
    pick: 'home',
    pointsPossible: 40,
    status: 'pending',
    correct: null,
    awardedPoints: null,
    awardedCoins: null,
    homeGoals: null,
    awayGoals: null,
  };
}

// ---------------------------------------------------------------------------
// splitFeatured — first upcoming fixture is the hero, the rest go in the grid
// ---------------------------------------------------------------------------

describe('splitFeatured', () => {
  it('returns null featured and empty rest for an empty list', () => {
    const { featured, rest } = splitFeatured([]);
    expect(featured).toBeNull();
    expect(rest).toEqual([]);
  });

  it('uses the only fixture as featured with an empty rest', () => {
    const a = fixture('a');
    const { featured, rest } = splitFeatured([a]);
    expect(featured).toBe(a);
    expect(rest).toEqual([]);
  });

  it('takes the first as featured and the remainder (in order) as rest', () => {
    const a = fixture('a');
    const b = fixture('b');
    const c = fixture('c');
    const { featured, rest } = splitFeatured([a, b, c]);
    expect(featured).toBe(a);
    expect(rest).toEqual([b, c]);
  });

  it('does not mutate the input array', () => {
    const list = [fixture('a'), fixture('b')];
    const snapshot = [...list];
    splitFeatured(list);
    expect(list).toEqual(snapshot);
  });
});

// ---------------------------------------------------------------------------
// recentPredictions — most-recent few, capped at the limit
// ---------------------------------------------------------------------------

describe('recentPredictions', () => {
  it('returns an empty array for an empty list', () => {
    expect(recentPredictions([], 3)).toEqual([]);
  });

  it('returns all when fewer than the limit, preserving order (newest-first)', () => {
    const list = [prediction('a'), prediction('b')];
    expect(recentPredictions(list, 3)).toEqual(list);
  });

  it('caps at the limit, keeping the first N (the query orders newest-first)', () => {
    const list = [prediction('a'), prediction('b'), prediction('c'), prediction('d')];
    const result = recentPredictions(list, 3);
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.fixtureId)).toEqual(['a', 'b', 'c']);
  });

  it('treats a non-positive limit as empty', () => {
    expect(recentPredictions([prediction('a')], 0)).toEqual([]);
    expect(recentPredictions([prediction('a')], -2)).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const list = [prediction('a'), prediction('b'), prediction('c')];
    const snapshot = [...list];
    recentPredictions(list, 2);
    expect(list).toEqual(snapshot);
  });
});
