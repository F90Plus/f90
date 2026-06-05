import { describe, expect, it } from 'vitest';
import { toTeaserEntries, type RankingRow } from '@/lib/rankings';

// A hand-built flag resolver keeps this unit pure — no dependency on the vendored
// flag-asset module. `getGlobalRankings` builds the real map from the countries seed.
const FLAGS = new Map<string, string | null>([
  ['ESP', '/flags/spain.svg'],
  ['ARG', '/flags/argentina.svg'],
  ['BRA', null], // a real country whose flag asset isn't vendored → null, never breaks
]);

function row(over: Partial<RankingRow> = {}): RankingRow {
  return {
    rank: 1,
    username: 'cuco',
    display_name: 'Cuco',
    country_code: 'ESP',
    total_points: 100,
    ...over,
  };
}

describe('toTeaserEntries', () => {
  it('returns an empty board while nobody has scored (all points 0 — pre-Phase-2)', () => {
    const rows = [row({ total_points: 0 }), row({ username: 'ann', total_points: 0 })];
    // Honesty invariant: a board full of 0-point rows is not a ranking — it's empty.
    expect(toTeaserEntries(rows, FLAGS, 5)).toEqual([]);
  });

  it('keeps only ranked players (points > 0) and drops zero-point rows', () => {
    const rows = [
      row({ rank: 1, username: 'top', total_points: 50 }),
      row({ rank: 2, username: 'zero', total_points: 0 }),
    ];
    const out = toTeaserEntries(rows, FLAGS, 5);
    expect(out).toHaveLength(1);
    expect(out[0]!.username).toBe('top');
  });

  it('maps a ranked row to a teaser entry with its nation flag', () => {
    const out = toTeaserEntries(
      [row({ rank: 3, username: 'leo', display_name: 'Leo', country_code: 'ARG', total_points: 240 })],
      FLAGS,
      5,
    );
    expect(out[0]).toEqual({
      rank: 3,
      username: 'leo',
      displayName: 'Leo',
      points: 240,
      countryCode: 'ARG',
      flag: '/flags/argentina.svg',
    });
  });

  it('tolerates a missing display name and a country with no flag asset', () => {
    const out = toTeaserEntries(
      [row({ username: 'silent', display_name: null, country_code: 'BRA', total_points: 10 })],
      FLAGS,
      5,
    );
    expect(out[0]!.displayName).toBeNull();
    expect(out[0]!.flag).toBeNull();
  });

  it('leaves the flag null when the player backs no country', () => {
    const out = toTeaserEntries([row({ country_code: null, total_points: 10 })], FLAGS, 5);
    expect(out[0]!.flag).toBeNull();
    expect(out[0]!.countryCode).toBeNull();
  });

  it('caps the board at the requested size, preserving the given order', () => {
    const rows = [1, 2, 3, 4, 5, 6, 7].map((n) => row({ rank: n, username: `p${n}`, total_points: 100 - n }));
    const out = toTeaserEntries(rows, FLAGS, 5);
    expect(out).toHaveLength(5);
    expect(out.map((e) => e.username)).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
  });
});
