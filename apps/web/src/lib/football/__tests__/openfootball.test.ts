import { describe, expect, it } from 'vitest';
import { toHomeMatch } from '../openfootball';

describe('toHomeMatch', () => {
  it('maps a real group-stage match into a HomeMatch', () => {
    const hm = toHomeMatch({
      team1: 'Mexico',
      team2: 'Brazil',
      group: 'Group A',
      date: '2026-06-11',
      time: '19:00 UTC-6',
      ground: 'Estadio Azteca',
    });
    expect(hm).not.toBeNull();
    expect(hm!.source).toBe('openfootball');
    expect(hm!.modeled).toBe(true);
    expect(hm!.home.name).toBe('Mexico');
    expect(hm!.away.name).toBe('Brazil');
    expect(hm!.home.code).toBeTruthy();
    expect(hm!.away.code).toBeTruthy();
    expect(hm!.prob.home + hm!.prob.draw + hm!.prob.away).toBeCloseTo(1, 6);
  });

  it('rejects knockout-placeholder fixtures (returns null)', () => {
    expect(toHomeMatch({ team1: '1A', team2: '2B' })).toBeNull();
    expect(toHomeMatch({ team1: 'Winner Group A', team2: 'Brazil' })).toBeNull();
  });
});
