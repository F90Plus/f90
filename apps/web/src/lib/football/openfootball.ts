import type { HomeMatch } from './types';
import { teamMeta } from './teams';
import { homeAdvantageFor, modelProbability } from './model';

/**
 * openfootball/worldcup.json — public domain, NO API key. The first real source:
 * the full WC2026 schedule (teams, groups, dates, venues). Cache-first
 * (revalidate 6h). NEVER throws — returns [] on any failure so callers fall back.
 */
const OPENFOOTBALL_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

interface OFMatch {
  round?: string;
  date?: string;
  time?: string;
  team1?: string;
  team2?: string;
  group?: string;
  ground?: string;
}
interface OFData {
  name?: string;
  matches?: OFMatch[];
}

// Knockout slots are placeholders ("Winner Group A", "1A", "3rd …"); group-stage
// entries are real country names (no digits, no placeholder words).
const PLACEHOLDER = /winner|runner|loser|place|tbd/i;
function isRealTeam(s: string | undefined): s is string {
  return typeof s === 'string' && s.length > 1 && !PLACEHOLDER.test(s) && !/\d/.test(s);
}

function parseKickoffISO(date: string | undefined, time: string | undefined): string | null {
  if (!date) return null;
  const [py, pmo, pd] = date.split('-');
  const y = Number(py);
  const mo = Number(pmo);
  const d = Number(pd);
  if (!y || !mo || !d) return null;
  const m = /(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})?/.exec(time ?? '');
  const hh = Number(m?.[1] ?? 12);
  const mm = Number(m?.[2] ?? 0);
  const off = Number(m?.[3] ?? 0); // local time at `off` → UTC hour = local - off
  return new Date(Date.UTC(y, mo - 1, d, hh - off, mm)).toISOString();
}

function timeLabelFrom(time: string | undefined): string | null {
  const m = /(\d{1,2}):(\d{2})/.exec(time ?? '');
  return m ? `${m[1]?.padStart(2, '0')}:${m[2]}` : null;
}

function toHomeMatch(m: OFMatch): HomeMatch | null {
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
