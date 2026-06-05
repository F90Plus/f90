import { describe, expect, it } from 'vitest';
import { groupPredictions } from '../predictions-model';
import type { UserPrediction } from '../queries';

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

function pred(
  fixtureId: string,
  status: UserPrediction['status'],
  correct: boolean | null = null,
): UserPrediction {
  return {
    fixtureId,
    homeCode: 'MEX',
    awayCode: 'RSA',
    kickoffISO: '2026-06-11T18:00:00Z',
    pick: 'home',
    pointsPossible: 40,
    status,
    correct,
    awardedPoints: correct === true ? 40 : correct === false ? 0 : null,
    awardedCoins: correct === true ? 20 : correct === false ? 0 : null,
    homeGoals: status === 'settled' ? 2 : null,
    awayGoals: status === 'settled' ? 1 : null,
  };
}

// ---------------------------------------------------------------------------
// groupPredictions
// ---------------------------------------------------------------------------

describe('groupPredictions', () => {
  it('returns empty groups for an empty list', () => {
    const { active, resolved } = groupPredictions([]);
    expect(active).toEqual([]);
    expect(resolved).toEqual([]);
  });

  it('puts pending predictions in active', () => {
    const p = pred('f1', 'pending');
    const { active, resolved } = groupPredictions([p]);
    expect(active).toEqual([p]);
    expect(resolved).toEqual([]);
  });

  it('puts locked predictions in active', () => {
    const p = pred('f2', 'locked');
    const { active, resolved } = groupPredictions([p]);
    expect(active).toEqual([p]);
    expect(resolved).toEqual([]);
  });

  it('puts settled predictions in resolved', () => {
    const p = pred('f3', 'settled', true);
    const { active, resolved } = groupPredictions([p]);
    expect(active).toEqual([]);
    expect(resolved).toEqual([p]);
  });

  it('correctly separates a mixed list, preserving newest-first order within each group', () => {
    // Input is newest-first (as getUserPredictions returns it)
    const list = [
      pred('settled-2', 'settled', false),
      pred('pending-1', 'pending'),
      pred('settled-1', 'settled', true),
      pred('locked-1', 'locked'),
      pred('pending-2', 'pending'),
    ];
    const { active, resolved } = groupPredictions(list);

    expect(active.map((p) => p.fixtureId)).toEqual(['pending-1', 'locked-1', 'pending-2']);
    expect(resolved.map((p) => p.fixtureId)).toEqual(['settled-2', 'settled-1']);
  });

  it('does not mutate the input array', () => {
    const list = [pred('a', 'pending'), pred('b', 'settled', true)];
    const snapshot = [...list];
    groupPredictions(list);
    expect(list).toEqual(snapshot);
  });

  it('handles a list that is entirely active', () => {
    const list = [pred('a', 'pending'), pred('b', 'locked')];
    const { active, resolved } = groupPredictions(list);
    expect(active).toHaveLength(2);
    expect(resolved).toHaveLength(0);
  });

  it('handles a list that is entirely resolved', () => {
    const list = [pred('a', 'settled', true), pred('b', 'settled', false)];
    const { active, resolved } = groupPredictions(list);
    expect(active).toHaveLength(0);
    expect(resolved).toHaveLength(2);
  });
});
