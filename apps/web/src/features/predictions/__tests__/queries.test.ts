import { describe, expect, it } from 'vitest';
import { toPredictableFixture, toUserPrediction } from '../queries';
import { safeParseOutcome } from '../validation';
import { pointsForProbability } from '@/lib/scoring';

// ---------------------------------------------------------------------------
// Shared fixture row stubs
// ---------------------------------------------------------------------------

const baseFixtureRow = {
  id: 'mex-rsa-2026-06-11',
  group_label: 'Group A',
  round: 'Group Stage',
  kickoff_at: '2026-06-11T18:00:00Z',
  home_code: 'MEX',
  away_code: 'RSA',
  home_goals: null as number | null,
  away_goals: null as number | null,
  prob_home: 0.5,
  prob_draw: 0.3,
  prob_away: 0.2,
  status: 'upcoming',
};

// ---------------------------------------------------------------------------
// toPredictableFixture
// ---------------------------------------------------------------------------

describe('toPredictableFixture', () => {
  it('maps basic fields correctly', () => {
    const result = toPredictableFixture(baseFixtureRow, null);
    expect(result.id).toBe('mex-rsa-2026-06-11');
    expect(result.groupLabel).toBe('Group A');
    expect(result.round).toBe('Group Stage');
    expect(result.kickoffISO).toBe('2026-06-11T18:00:00Z');
    expect(result.homeCode).toBe('MEX');
    expect(result.awayCode).toBe('RSA');
  });

  it('attaches points via pointsForProbability for each outcome', () => {
    const result = toPredictableFixture(baseFixtureRow, null);
    expect(result.points.home).toBe(pointsForProbability(0.5));
    expect(result.points.draw).toBe(pointsForProbability(0.3));
    expect(result.points.away).toBe(pointsForProbability(0.2));
  });

  it('computes lean as the outcome with the highest probability', () => {
    // prob_home=0.5 is the highest
    expect(toPredictableFixture(baseFixtureRow, null).lean).toBe('home');

    // draw is highest
    expect(
      toPredictableFixture({ ...baseFixtureRow, prob_home: 0.2, prob_draw: 0.6, prob_away: 0.2 }, null).lean,
    ).toBe('draw');

    // away is highest
    expect(
      toPredictableFixture({ ...baseFixtureRow, prob_home: 0.1, prob_draw: 0.2, prob_away: 0.7 }, null).lean,
    ).toBe('away');
  });

  it('passes through userPick when provided', () => {
    const result = toPredictableFixture(baseFixtureRow, 'draw');
    expect(result.userPick).toBe('draw');
  });

  it('sets userPick to null when not provided', () => {
    expect(toPredictableFixture(baseFixtureRow, null).userPick).toBeNull();
  });

  it('handles null probabilities gracefully — returns points 0, lean from non-null probs', () => {
    const row = { ...baseFixtureRow, prob_home: null, prob_draw: null, prob_away: null };
    const result = toPredictableFixture(row, null);
    expect(result.points.home).toBe(0);
    expect(result.points.draw).toBe(0);
    expect(result.points.away).toBe(0);
    // lean must still be one of the valid outcomes (any is fine when all null)
    expect(['home', 'draw', 'away']).toContain(result.lean);
  });

  it('handles partial null probabilities — uses available probs for lean', () => {
    const row = { ...baseFixtureRow, prob_home: null, prob_draw: 0.4, prob_away: 0.6 };
    const result = toPredictableFixture(row, null);
    expect(result.points.home).toBe(0);
    expect(result.points.draw).toBe(pointsForProbability(0.4));
    expect(result.points.away).toBe(pointsForProbability(0.6));
    expect(result.lean).toBe('away');
  });
});

// ---------------------------------------------------------------------------
// toUserPrediction
// ---------------------------------------------------------------------------

const basePredictionRow = {
  id: 1,
  user_id: 'user-abc',
  fixture_id: 'mex-rsa-2026-06-11',
  kind: 'match_result' as const,
  payload: { outcome: 'home' },
  points_possible: 40,
  settled_at: null as string | null,
  awarded_points: null as number | null,
  awarded_coins: null as number | null,
  created_at: '2026-06-10T10:00:00Z',
  updated_at: '2026-06-10T10:00:00Z',
};

describe('toUserPrediction', () => {
  const BEFORE_KICKOFF = new Date('2026-06-10T10:00:00Z'); // before 2026-06-11
  const AFTER_KICKOFF = new Date('2026-06-12T10:00:00Z');  // after 2026-06-11

  it('maps basic fields', () => {
    const result = toUserPrediction(basePredictionRow, baseFixtureRow, BEFORE_KICKOFF, 'home');
    expect(result.fixtureId).toBe('mex-rsa-2026-06-11');
    expect(result.homeCode).toBe('MEX');
    expect(result.awayCode).toBe('RSA');
    expect(result.kickoffISO).toBe('2026-06-11T18:00:00Z');
    expect(result.pick).toBe('home');
    expect(result.pointsPossible).toBe(40);
  });

  it('status is "pending" when kickoff is in the future and not settled', () => {
    const result = toUserPrediction(basePredictionRow, baseFixtureRow, BEFORE_KICKOFF, 'home');
    expect(result.status).toBe('pending');
    expect(result.correct).toBeNull();
  });

  it('status is "locked" when kickoff has passed and not settled', () => {
    const result = toUserPrediction(basePredictionRow, baseFixtureRow, AFTER_KICKOFF, 'home');
    expect(result.status).toBe('locked');
    expect(result.correct).toBeNull();
  });

  it('status is "settled" when settled_at is set, regardless of kickoff', () => {
    const settledRow = {
      ...basePredictionRow,
      settled_at: '2026-06-11T22:00:00Z',
      awarded_points: 40,
      awarded_coins: 40,
    };
    const result = toUserPrediction(settledRow, baseFixtureRow, BEFORE_KICKOFF, 'home');
    expect(result.status).toBe('settled');
  });

  it('correct is true when settled with positive awarded_points', () => {
    const settledRow = {
      ...basePredictionRow,
      settled_at: '2026-06-11T22:00:00Z',
      awarded_points: 40,
      awarded_coins: 40,
    };
    expect(toUserPrediction(settledRow, baseFixtureRow, AFTER_KICKOFF, 'home').correct).toBe(true);
  });

  it('correct is false when settled with zero or null awarded_points', () => {
    const settledWrong = {
      ...basePredictionRow,
      settled_at: '2026-06-11T22:00:00Z',
      awarded_points: 0,
      awarded_coins: 0,
    };
    expect(toUserPrediction(settledWrong, baseFixtureRow, AFTER_KICKOFF, 'home').correct).toBe(false);

    const settledNull = {
      ...basePredictionRow,
      settled_at: '2026-06-11T22:00:00Z',
      awarded_points: null,
      awarded_coins: null,
    };
    expect(toUserPrediction(settledNull, baseFixtureRow, AFTER_KICKOFF, 'home').correct).toBe(false);
  });

  it('correct is null when not settled', () => {
    expect(toUserPrediction(basePredictionRow, baseFixtureRow, BEFORE_KICKOFF, 'home').correct).toBeNull();
    expect(toUserPrediction(basePredictionRow, baseFixtureRow, AFTER_KICKOFF, 'home').correct).toBeNull();
  });

  it('exposes awardedPoints, awardedCoins and goals from fixture', () => {
    const settledRow = {
      ...basePredictionRow,
      settled_at: '2026-06-11T22:00:00Z',
      awarded_points: 40,
      awarded_coins: 40,
    };
    const fixtureWithGoals = { ...baseFixtureRow, home_goals: 2, away_goals: 1 };
    const result = toUserPrediction(settledRow, fixtureWithGoals, AFTER_KICKOFF, 'home');
    expect(result.awardedPoints).toBe(40);
    expect(result.awardedCoins).toBe(40);
    expect(result.homeGoals).toBe(2);
    expect(result.awayGoals).toBe(1);
  });

  it('exposes null goals when fixture has no result yet', () => {
    const result = toUserPrediction(basePredictionRow, baseFixtureRow, BEFORE_KICKOFF, 'home');
    expect(result.homeGoals).toBeNull();
    expect(result.awayGoals).toBeNull();
  });

  it('passes through the pick argument directly', () => {
    expect(toUserPrediction(basePredictionRow, baseFixtureRow, BEFORE_KICKOFF, 'draw').pick).toBe('draw');
    expect(toUserPrediction(basePredictionRow, baseFixtureRow, BEFORE_KICKOFF, 'away').pick).toBe('away');
  });
});

// ---------------------------------------------------------------------------
// Fix 4: tie-break order + safe-parse outcome tests
// ---------------------------------------------------------------------------

describe('argmaxOutcome / lean tie-break (documented: home > draw > away)', () => {
  it('three-way tie yields "home"', () => {
    const row = { ...baseFixtureRow, prob_home: 0.333, prob_draw: 0.333, prob_away: 0.333 };
    expect(toPredictableFixture(row, null).lean).toBe('home');
  });

  it('exact equal probs yields "home"', () => {
    const row = { ...baseFixtureRow, prob_home: 0.5, prob_draw: 0.5, prob_away: 0.5 };
    expect(toPredictableFixture(row, null).lean).toBe('home');
  });

  it('home/draw two-way tie yields "home"', () => {
    const row = { ...baseFixtureRow, prob_home: 0.4, prob_draw: 0.4, prob_away: 0.2 };
    expect(toPredictableFixture(row, null).lean).toBe('home');
  });

  it('draw/away two-way tie yields "draw"', () => {
    const row = { ...baseFixtureRow, prob_home: 0.1, prob_draw: 0.45, prob_away: 0.45 };
    expect(toPredictableFixture(row, null).lean).toBe('draw');
  });
});

describe('safeParseOutcome', () => {
  it('returns the Outcome for valid values', () => {
    expect(safeParseOutcome('home')).toBe('home');
    expect(safeParseOutcome('draw')).toBe('draw');
    expect(safeParseOutcome('away')).toBe('away');
  });

  it('returns null for invalid values', () => {
    expect(safeParseOutcome('invalid')).toBeNull();
    expect(safeParseOutcome('')).toBeNull();
    expect(safeParseOutcome(null)).toBeNull();
    expect(safeParseOutcome(undefined)).toBeNull();
    expect(safeParseOutcome(42)).toBeNull();
    expect(safeParseOutcome('Home')).toBeNull(); // case-sensitive
  });
});

describe('toPredictableFixture — invalid stored outcome → userPick null', () => {
  it('safeParseOutcome("corrupt") is null, so toPredictableFixture(row, null).userPick is null', () => {
    // The caller (getPredictableFixtures) safe-parses before building the pickMap,
    // so a corrupt stored outcome simply doesn't appear in the map → null.
    // We test the boundary: safeParseOutcome returns null for corrupt values,
    // and toPredictableFixture passes through whatever userPick is given.
    const corrupted = safeParseOutcome('corrupt_outcome');
    expect(corrupted).toBeNull();
    // When the pickMap entry is absent (null returned from safe-parse → not set),
    // toPredictableFixture receives null and forwards it:
    const result = toPredictableFixture(baseFixtureRow, corrupted ?? null);
    expect(result.userPick).toBeNull();
  });

  it('toPredictableFixture passes a valid Outcome through unchanged', () => {
    const valid = safeParseOutcome('away');
    expect(valid).toBe('away');
    const result = toPredictableFixture(baseFixtureRow, valid ?? null);
    expect(result.userPick).toBe('away');
  });
});
