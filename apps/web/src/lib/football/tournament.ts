import type { HomeMatch } from './types';
import { type Confederation, confederationOf } from './confederations';
import { teamMeta } from './teams';
import { flagAssetFor } from './flags';
import { isRealTeam, parseKickoffISO, timeLabelFrom } from './util';
import { OPENFOOTBALL_URL, type OFData, toHomeMatch } from './openfootball';

/**
 * Tournament reader — the canonical spine of the Tournament Center. ONE cache-first
 * openfootball read, derived into the field (groups), the road (bracket) and the
 * curated key matches. Pure `parseTournament` + thin `getTournament` fetch wrapper.
 * NEVER throws — honest degradation to a `fallback` shape (never invents data).
 */

export type KnockoutRound = 'R32' | 'R16' | 'QF' | 'SF' | 'THIRD' | 'FINAL';

export interface TournamentTeam {
  name: string;
  code: string;
  accent: string;
  flag: string | null;
  confederation: Confederation | null;
  isHost: boolean;
}

export interface TournamentGroup {
  id: string; // 'A'..'L'
  label: string; // 'Group A'
  teams: TournamentTeam[];
}

/** A knockout slot is a decided team, a group position, a best-third, or a match feed. */
export type SlotRef =
  | { kind: 'team'; team: TournamentTeam }
  | { kind: 'group-winner'; group: string }
  | { kind: 'group-runner'; group: string }
  | { kind: 'third'; groups: string[] }
  | { kind: 'match-winner'; match: number }
  | { kind: 'match-loser'; match: number }
  | { kind: 'unknown'; raw: string };

export interface BracketSlot {
  raw: string;
  ref: SlotRef;
}

export interface BracketMatch {
  num: number | null;
  round: KnockoutRound;
  dateISO: string | null;
  timeLabel: string | null;
  ground: string | null;
  home: BracketSlot;
  away: BracketSlot;
}

export interface Bracket {
  R32: BracketMatch[];
  R16: BracketMatch[];
  QF: BracketMatch[];
  SF: BracketMatch[];
  third: BracketMatch | null;
  final: BracketMatch | null;
}

export interface TournamentMeta {
  nationCount: number;
  groupCount: number;
  venueCount: number;
  hostCount: number;
  matchCount: number;
  kickoffISO: string | null;
  source: 'openfootball' | 'fallback';
}

export interface Tournament {
  meta: TournamentMeta;
  groups: TournamentGroup[];
  bracket: Bracket;
  keyMatches: HomeMatch[];
}

const FALLBACK: Tournament = {
  meta: {
    nationCount: 0,
    groupCount: 0,
    venueCount: 0,
    hostCount: 3,
    matchCount: 0,
    kickoffISO: null,
    source: 'fallback',
  },
  groups: [],
  bracket: { R32: [], R16: [], QF: [], SF: [], third: null, final: null },
  keyMatches: [],
};

const HOST_NAMES = new Set(['USA', 'Canada', 'Mexico']);

export function toTournamentTeam(name: string): TournamentTeam {
  const meta = teamMeta(name);
  return {
    name,
    code: meta.code,
    accent: meta.accent,
    flag: flagAssetFor(name),
    confederation: confederationOf(name),
    isHost: HOST_NAMES.has(name),
  };
}

const RE_GROUP = /^([12])([A-L])$/; // 1A (winner), 2B (runner-up)
const RE_THIRD = /^3([A-L](?:\/[A-L])*)$/; // 3A/B/C/D/F (best third from these groups)
const RE_WIN = /^W(\d+)$/; // W73 (winner of match 73)
const RE_LOSE = /^L(\d+)$/; // L101 (loser of match 101 → third-place feed)

/** Decode an openfootball advancement token into a structured slot reference. */
export function decodeSlot(raw: string, resolve: (name: string) => TournamentTeam): SlotRef {
  const t = (raw ?? '').trim();
  if (isRealTeam(t)) return { kind: 'team', team: resolve(t) };
  let m: RegExpExecArray | null;
  if ((m = RE_GROUP.exec(t))) {
    return m[1] === '1'
      ? { kind: 'group-winner', group: m[2]! }
      : { kind: 'group-runner', group: m[2]! };
  }
  if ((m = RE_THIRD.exec(t))) return { kind: 'third', groups: m[1]!.split('/') };
  if ((m = RE_WIN.exec(t))) return { kind: 'match-winner', match: Number(m[1]) };
  if ((m = RE_LOSE.exec(t))) return { kind: 'match-loser', match: Number(m[1]) };
  return { kind: 'unknown', raw: t };
}

const ROUND_BY_LABEL: Record<string, KnockoutRound> = {
  'round of 32': 'R32',
  'round of 16': 'R16',
  'quarter-final': 'QF',
  'quarterfinal': 'QF',
  'quarter-finals': 'QF',
  'semi-final': 'SF',
  'semifinal': 'SF',
  'semi-finals': 'SF',
  'match for third place': 'THIRD',
  'third place': 'THIRD',
  final: 'FINAL',
};

function roundFrom(label: string | undefined): KnockoutRound | null {
  return label ? (ROUND_BY_LABEL[label.trim().toLowerCase()] ?? null) : null;
}

function groupLetter(group: string | undefined): string {
  return (group ?? '').replace(/group\s*/i, '').trim().toUpperCase();
}

/** Opener (earliest kickoff) first, then the highest-rated upcoming ties by model strength. */
function curateKeyMatches(all: HomeMatch[], count = 5): HomeMatch[] {
  const pool = all.filter((m) => m.kickoffISO).length ? all.filter((m) => m.kickoffISO) : all;
  const byDate = [...pool].sort((a, b) =>
    String(a.kickoffISO).localeCompare(String(b.kickoffISO)),
  );
  const opener = byDate[0];
  const rest = byDate
    .filter((m) => m.id !== opener?.id)
    .sort(
      (a, b) => b.home.strength + b.away.strength - (a.home.strength + a.away.strength),
    );
  return [opener, ...rest].filter((m): m is HomeMatch => Boolean(m)).slice(0, count);
}

export function parseTournament(raw: unknown): Tournament {
  const data = (raw ?? {}) as OFData;
  const matches = Array.isArray(data.matches) ? data.matches : [];
  if (matches.length === 0) return FALLBACK;

  // The field — group teams in first-seen (draw) order.
  const order = new Map<string, string[]>();
  const seen = new Map<string, Set<string>>();
  for (const m of matches) {
    if (!m.group) continue;
    const id = groupLetter(m.group);
    if (!id) continue;
    if (!order.has(id)) {
      order.set(id, []);
      seen.set(id, new Set());
    }
    for (const name of [m.team1, m.team2]) {
      if (isRealTeam(name) && !seen.get(id)!.has(name)) {
        seen.get(id)!.add(name);
        order.get(id)!.push(name);
      }
    }
  }
  const groups: TournamentGroup[] = [...order.keys()].sort().map((id) => ({
    id,
    label: `Group ${id}`,
    teams: order.get(id)!.map(toTournamentTeam),
  }));

  // The road — knockout matches bucketed by round, wired through decodeSlot.
  const buckets: Record<KnockoutRound, BracketMatch[]> = {
    R32: [],
    R16: [],
    QF: [],
    SF: [],
    THIRD: [],
    FINAL: [],
  };
  for (const m of matches) {
    const round = roundFrom(m.round);
    if (!round) continue;
    buckets[round].push({
      num: typeof m.num === 'number' ? m.num : null,
      round,
      dateISO: m.date ?? null,
      timeLabel: timeLabelFrom(m.time),
      ground: m.ground ?? null,
      home: { raw: m.team1 ?? '', ref: decodeSlot(m.team1 ?? '', toTournamentTeam) },
      away: { raw: m.team2 ?? '', ref: decodeSlot(m.team2 ?? '', toTournamentTeam) },
    });
  }
  const byNum = (a: BracketMatch, b: BracketMatch) => (a.num ?? Infinity) - (b.num ?? Infinity);
  const bracket: Bracket = {
    R32: buckets.R32.sort(byNum),
    R16: buckets.R16.sort(byNum),
    QF: buckets.QF.sort(byNum),
    SF: buckets.SF.sort(byNum),
    third: buckets.THIRD[0] ?? null,
    final: buckets.FINAL[0] ?? null,
  };

  // Honest meta, all derived from the source.
  const nations = new Set<string>();
  const cities = new Set<string>();
  let kickoffISO: string | null = null;
  for (const m of matches) {
    if (isRealTeam(m.team1)) nations.add(m.team1);
    if (isRealTeam(m.team2)) nations.add(m.team2);
    if (m.ground) cities.add(m.ground.split(' (')[0]!.trim());
    const k = parseKickoffISO(m.date, m.time);
    if (k && (!kickoffISO || k < kickoffISO)) kickoffISO = k;
  }

  // Key matches — group play only (toHomeMatch drops knockout placeholders).
  const homeMatches = matches
    .map(toHomeMatch)
    .filter((m): m is HomeMatch => m !== null);
  const keyMatches = curateKeyMatches(homeMatches);

  return {
    meta: {
      nationCount: nations.size,
      groupCount: groups.length,
      venueCount: cities.size,
      hostCount: 3,
      matchCount: matches.length,
      kickoffISO,
      source: 'openfootball',
    },
    groups,
    bracket,
    keyMatches,
  };
}

export async function getTournament(): Promise<Tournament> {
  try {
    const res = await fetch(OPENFOOTBALL_URL, { next: { revalidate: 21600 } });
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as OFData;
    return parseTournament(data);
  } catch {
    return FALLBACK;
  }
}
