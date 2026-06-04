import { describe, expect, it } from 'vitest';
import { decodeSlot, parseTournament, toTournamentTeam } from '../tournament';

/** A representative slice of openfootball's 2026 shape: 2 groups + a few knockout ties. */
const RAW = {
  name: 'World Cup 2026',
  matches: [
    // Group A
    { round: 'Matchday 1', date: '2026-06-11', time: '13:00 UTC-6', team1: 'Mexico', team2: 'South Africa', group: 'Group A', ground: 'Mexico City' },
    { round: 'Matchday 1', date: '2026-06-12', time: '16:00 UTC-5', team1: 'South Korea', team2: 'Czech Republic', group: 'Group A', ground: 'Atlanta' },
    // Group B
    { round: 'Matchday 1', date: '2026-06-12', time: '13:00 UTC-7', team1: 'Canada', team2: 'Switzerland', group: 'Group B', ground: 'Vancouver' },
    { round: 'Matchday 1', date: '2026-06-13', time: '18:00 UTC-4', team1: 'Qatar', team2: 'Bosnia & Herzegovina', group: 'Group B', ground: 'Toronto' },
    // Knockout
    { round: 'Round of 32', num: 73, date: '2026-06-28', time: '12:00 UTC-7', team1: '2A', team2: '2B', ground: 'Los Angeles (Inglewood)' },
    { round: 'Round of 32', num: 74, date: '2026-06-29', time: '12:00 UTC-5', team1: '1E', team2: '3A/B/C/D/F', ground: 'Dallas' },
    { round: 'Round of 16', num: 89, date: '2026-07-04', time: '12:00 UTC-5', team1: 'W74', team2: 'W77', ground: 'Dallas' },
    { round: 'Match for third place', date: '2026-07-18', time: '12:00 UTC-4', team1: 'L101', team2: 'L102', ground: 'Miami' },
    { round: 'Final', date: '2026-07-19', time: '12:00 UTC-4', team1: 'W101', team2: 'W102', ground: 'East Rutherford' },
  ],
};

describe('toTournamentTeam', () => {
  it('enriches a nation with code, accent, flag, confederation and host flag', () => {
    const mex = toTournamentTeam('Mexico');
    expect(mex.code).toBe('MEX');
    expect(mex.flag).toBe('/flags/mx.svg');
    expect(mex.confederation).toBe('CONCACAF');
    expect(mex.isHost).toBe(true);
    expect(toTournamentTeam('Brazil').isHost).toBe(false);
  });
});

describe('decodeSlot', () => {
  it('decodes group winner / runner-up codes', () => {
    expect(decodeSlot('1E', toTournamentTeam)).toEqual({ kind: 'group-winner', group: 'E' });
    expect(decodeSlot('2A', toTournamentTeam)).toEqual({ kind: 'group-runner', group: 'A' });
  });

  it('decodes best-third codes into their candidate groups', () => {
    expect(decodeSlot('3A/B/C/D/F', toTournamentTeam)).toEqual({
      kind: 'third',
      groups: ['A', 'B', 'C', 'D', 'F'],
    });
  });

  it('decodes match winner / loser feeds', () => {
    expect(decodeSlot('W74', toTournamentTeam)).toEqual({ kind: 'match-winner', match: 74 });
    expect(decodeSlot('L101', toTournamentTeam)).toEqual({ kind: 'match-loser', match: 101 });
  });

  it('resolves an already-decided real team', () => {
    const slot = decodeSlot('Brazil', toTournamentTeam);
    expect(slot.kind).toBe('team');
    if (slot.kind === 'team') expect(slot.team.code).toBe('BRA');
  });

  it('falls back to unknown for an unrecognized coded token, preserving the raw', () => {
    // a digit-bearing token that matches no known code shape (real names → team)
    expect(decodeSlot('4A', toTournamentTeam)).toEqual({ kind: 'unknown', raw: '4A' });
  });
});

describe('parseTournament', () => {
  const t = parseTournament(RAW);

  it('groups real teams by their group letter (4 per group)', () => {
    expect(t.groups.map((g) => g.id)).toEqual(['A', 'B']);
    const a = t.groups.find((g) => g.id === 'A')!;
    expect(a.teams.map((x) => x.name).sort()).toEqual([
      'Czech Republic',
      'Mexico',
      'South Africa',
      'South Korea',
    ]);
    expect(a.teams.every((x) => x.flag !== null)).toBe(true);
  });

  it('buckets knockout matches by round and sorts by num', () => {
    expect(t.bracket.R32.map((m) => m.num)).toEqual([73, 74]);
    expect(t.bracket.R16).toHaveLength(1);
    expect(t.bracket.final).not.toBeNull();
    expect(t.bracket.third).not.toBeNull();
  });

  it('wires bracket slots through decodeSlot', () => {
    expect(t.bracket.R32[0]!.home.ref).toEqual({ kind: 'group-runner', group: 'A' });
    expect(t.bracket.R32[1]!.away.ref).toEqual({ kind: 'third', groups: ['A', 'B', 'C', 'D', 'F'] });
    expect(t.bracket.final!.home.ref).toEqual({ kind: 'match-winner', match: 101 });
    expect(t.bracket.third!.home.ref).toEqual({ kind: 'match-loser', match: 101 });
  });

  it('computes honest meta from the source', () => {
    expect(t.meta.source).toBe('openfootball');
    expect(t.meta.nationCount).toBe(8);
    expect(t.meta.groupCount).toBe(2);
    expect(t.meta.matchCount).toBe(9);
    expect(t.meta.kickoffISO).toBe('2026-06-11T19:00:00.000Z');
  });

  it('curates key matches from group play with the opener first', () => {
    expect(t.keyMatches.length).toBeGreaterThan(0);
    expect(t.keyMatches.every((m) => m.source === 'openfootball')).toBe(true);
    expect(t.keyMatches[0]!.home.name).toBe('Mexico'); // earliest kickoff
    // no knockout placeholder ever leaks into key matches
    expect(t.keyMatches.some((m) => /\d/.test(m.home.code) || /\d/.test(m.away.code))).toBe(false);
  });

  it('degrades honestly on empty / malformed input', () => {
    const f = parseTournament({});
    expect(f.meta.source).toBe('fallback');
    expect(f.groups).toHaveLength(0);
    expect(f.bracket.R32).toHaveLength(0);
    expect(f.keyMatches).toHaveLength(0);
  });
});
