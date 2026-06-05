import type { HomeMatch } from './types';
import { teamMeta } from './teams';
import { homeAdvantageFor, modelProbability } from './model';
import { isRealTeam, OPENFOOTBALL_URL, parseKickoffISO, timeLabelFrom } from './util';

/**
 * openfootball/worldcup.json — public domain, NO API key. The first real source:
 * the full WC2026 schedule (teams, groups, dates, venues). Cache-first
 * (revalidate 6h). NEVER throws — returns [] on any failure so callers fall back.
 * The source URL lives in ./util (single source of truth); re-exported here so
 * existing importers (e.g. tournament.ts) keep importing it from this module.
 */
export { OPENFOOTBALL_URL };

/**
 * A played match's score block, as openfootball encodes it (verified against
 * worldcup.json/2022): `ft` = full-time [homeGoals, awayGoals]; `ht` = half-time.
 * Absent entirely until the match is played. `ft` is the authoritative result —
 * `goals1`/`goals2` (event lists) are deliberately not modelled here.
 */
export interface OFScore {
  ft?: [number, number] | number[];
  ht?: [number, number] | number[];
}

export interface OFMatch {
  round?: string;
  num?: number;
  date?: string;
  time?: string;
  team1?: string;
  team2?: string;
  group?: string;
  ground?: string;
  /** Present only once the match has been played; see OFScore. */
  score?: OFScore;
}
export interface OFData {
  name?: string;
  matches?: OFMatch[];
}

/** Map a real (group-stage) openfootball match to the homepage's HomeMatch shape. */
export function toHomeMatch(m: OFMatch): HomeMatch | null {
  if (!isRealTeam(m.team1) || !isRealTeam(m.team2)) return null;
  const home = teamMeta(m.team1);
  const away = teamMeta(m.team2);
  const ha = homeAdvantageFor(m.team1);
  return {
    id: `${home.code}-${away.code}`.toLowerCase(),
    group: (m.group ?? '').replace(/group\s*/i, '').trim() || '—',
    kickoffISO: parseKickoffISO(m.date, m.time),
    dateISO: m.date ?? null,
    timeLabel: timeLabelFrom(m.time),
    ground: m.ground ?? null,
    status: 'upcoming',
    home: { code: home.code, name: m.team1, accent: home.accent, strength: home.strength },
    away: { code: away.code, name: m.team2, accent: away.accent, strength: away.strength },
    prob: modelProbability(home.strength, away.strength, ha),
    modeled: true,
    source: 'openfootball',
  };
}

export async function getOpenfootballFixtures(): Promise<HomeMatch[]> {
  try {
    const res = await fetch(OPENFOOTBALL_URL, { next: { revalidate: 21600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as OFData;
    const out: HomeMatch[] = [];
    for (const m of data.matches ?? []) {
      const hm = toHomeMatch(m);
      if (hm) out.push(hm);
    }
    return out;
  } catch {
    return [];
  }
}
