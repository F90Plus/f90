import { describe, expect, it } from 'vitest';
import { toTeaserEntries, toPageEntries, markCurrentUser, type RankingRow, type RankingPageRow } from '@/lib/rankings';

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

function pageRow(over: Partial<RankingPageRow> = {}): RankingPageRow {
  return {
    user_id: 'user-1',
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

describe('toPageEntries', () => {
  it('returns empty array when all rows have 0 points (pre-Phase-2 honesty)', () => {
    const rows = [pageRow({ total_points: 0 }), pageRow({ user_id: 'u2', username: 'b', total_points: 0 })];
    expect(toPageEntries(rows, FLAGS, 100, null)).toEqual([]);
  });

  it('includes user_id and isCurrentUser=false when currentUserId is null', () => {
    const out = toPageEntries([pageRow({ user_id: 'u1', total_points: 50 })], FLAGS, 100, null);
    expect(out[0]!.userId).toBe('u1');
    expect(out[0]!.isCurrentUser).toBe(false);
  });

  it('marks the matching row as isCurrentUser=true', () => {
    const rows = [
      pageRow({ user_id: 'u1', rank: 1, username: 'alpha', total_points: 200 }),
      pageRow({ user_id: 'u2', rank: 2, username: 'beta', total_points: 100 }),
    ];
    const out = toPageEntries(rows, FLAGS, 100, 'u2');
    expect(out.find((e) => e.username === 'alpha')!.isCurrentUser).toBe(false);
    expect(out.find((e) => e.username === 'beta')!.isCurrentUser).toBe(true);
  });

  it('does not mark any row when currentUserId is not on the board', () => {
    const rows = [pageRow({ user_id: 'u1', total_points: 100 })];
    const out = toPageEntries(rows, FLAGS, 100, 'u99');
    expect(out[0]!.isCurrentUser).toBe(false);
  });

  it('projects flag correctly from flagByCode', () => {
    const out = toPageEntries(
      [pageRow({ user_id: 'u1', country_code: 'ARG', total_points: 80 })],
      FLAGS,
      100,
      null,
    );
    expect(out[0]!.flag).toBe('/flags/argentina.svg');
  });

  it('caps at the requested limit', () => {
    const rows = [1, 2, 3, 4, 5].map((n) =>
      pageRow({ user_id: `u${n}`, rank: n, username: `p${n}`, total_points: 100 - n }),
    );
    const out = toPageEntries(rows, FLAGS, 3, null);
    expect(out).toHaveLength(3);
  });
});

describe('markCurrentUser', () => {
  it('marks the entry whose userId matches currentUserId', () => {
    const entries = [
      { rank: 1, username: 'a', displayName: null, points: 100, countryCode: null, flag: null },
      { rank: 2, username: 'b', displayName: null, points: 80, countryCode: null, flag: null },
    ];
    const ids = ['uid-a', 'uid-b'];
    const out = markCurrentUser(entries, 'uid-b', ids);
    expect(out[0]!.isCurrentUser).toBe(false);
    expect(out[1]!.isCurrentUser).toBe(true);
  });

  it('marks none when currentUserId is null', () => {
    const entries = [
      { rank: 1, username: 'a', displayName: null, points: 100, countryCode: null, flag: null },
    ];
    const out = markCurrentUser(entries, null, ['uid-a']);
    expect(out[0]!.isCurrentUser).toBe(false);
  });

  it('marks none when currentUserId is not in the list', () => {
    const entries = [
      { rank: 1, username: 'a', displayName: null, points: 100, countryCode: null, flag: null },
    ];
    const out = markCurrentUser(entries, 'uid-unknown', ['uid-a']);
    expect(out[0]!.isCurrentUser).toBe(false);
  });

  it('carries through userId from the rowUserIds array', () => {
    const entries = [
      { rank: 1, username: 'a', displayName: null, points: 100, countryCode: null, flag: null },
    ];
    const out = markCurrentUser(entries, null, ['the-user-id']);
    expect(out[0]!.userId).toBe('the-user-id');
  });
});
