import { describe, expect, it } from 'vitest';
import { outcomeOf, resultFromMatch } from '../settlement';
import type { OFMatch } from '@/lib/football/openfootball';

describe('outcomeOf — match-result winner from goals', () => {
  it('home win → "home"', () => {
    expect(outcomeOf(2, 0)).toBe('home');
  });
  it('draw → "draw"', () => {
    expect(outcomeOf(1, 1)).toBe('draw');
  });
  it('away win → "away"', () => {
    expect(outcomeOf(0, 3)).toBe('away');
  });
  it('0-0 → "draw"', () => {
    expect(outcomeOf(0, 0)).toBe('draw');
  });
  it('mirrors the SQL CASE: > → home, = → draw, < → away (boundary 3-2/2-3)', () => {
    expect(outcomeOf(3, 2)).toBe('home');
    expect(outcomeOf(2, 3)).toBe('away');
  });
});

describe('resultFromMatch — read PLAYED scores from a raw openfootball match', () => {
  // openfootball encodes a played match's full-time score as score.ft = [home, away]
  // (confirmed against worldcup.json/2022). goals1/goals2 are event lists, not scores.
  it('reads score.ft [home, away] when the match has been played', () => {
    const m: OFMatch = {
      team1: 'Qatar',
      team2: 'Ecuador',
      score: { ft: [0, 2], ht: [0, 2] },
    } as OFMatch;
    expect(resultFromMatch(m)).toEqual({ homeGoals: 0, awayGoals: 2 });
  });

  it('reads a home win', () => {
    const m: OFMatch = {
      team1: 'Argentina',
      team2: 'France',
      score: { ft: [3, 1] },
    } as OFMatch;
    expect(resultFromMatch(m)).toEqual({ homeGoals: 3, awayGoals: 1 });
  });

  it('returns null for a not-yet-played match (no score field — the WC2026 schedule shape)', () => {
    const m: OFMatch = {
      round: 'Matchday 1',
      date: '2026-06-11',
      time: '13:00 UTC-6',
      team1: 'Mexico',
      team2: 'South Africa',
      group: 'Group A',
      ground: 'Mexico City',
    };
    expect(resultFromMatch(m)).toBeNull();
  });

  it('returns null when score exists but ft is absent (only ht known — match in progress)', () => {
    const m: OFMatch = {
      team1: 'Mexico',
      team2: 'South Africa',
      score: { ht: [1, 0] },
    } as OFMatch;
    expect(resultFromMatch(m)).toBeNull();
  });

  it('returns null when ft is malformed (not a 2-number array)', () => {
    const bad1 = { team1: 'A', team2: 'B', score: { ft: [1] } } as unknown as OFMatch;
    const bad2 = { team1: 'A', team2: 'B', score: { ft: ['1', '2'] } } as unknown as OFMatch;
    expect(resultFromMatch(bad1)).toBeNull();
    expect(resultFromMatch(bad2)).toBeNull();
  });
});
