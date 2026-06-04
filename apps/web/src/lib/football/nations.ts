/**
 * World Cup nations — globe state layer (DATA FIDELITY, DECISIONS D-023).
 *
 * The globe is a LIVING OFFICIAL map: gold = host · green = officially qualified ·
 * red = eliminated-during-tournament · neutral = not in the field. The qualified set is
 * READ FROM THE REAL SOURCE the app already uses (openfootball/worldcup.json 2026) —
 * never hand-authored. We only map a few team names to geojson polygon names, and add
 * point fallbacks for qualified nations that have no polygon at 110m resolution.
 */
import { isRealTeam } from './util';

const OPENFOOTBALL_URL =
  'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

/** The three confirmed hosts (geojson ADMIN names). */
export const WC_HOST_ADMINS = ['United States of America', 'Canada', 'Mexico'] as const;

/** openfootball team name → geojson ADMIN (only the names that differ). */
const NAME_TO_ADMIN: Record<string, string> = {
  USA: 'United States of America',
  England: 'United Kingdom',
  Scotland: 'United Kingdom',
  'Bosnia & Herzegovina': 'Bosnia and Herzegovina',
  'Czech Republic': 'Czechia',
  'DR Congo': 'Democratic Republic of the Congo',
};

/** Qualified nations with no polygon in the 110m geojson → drawn as points (real centroids). */
const NO_POLYGON: Record<string, { lat: number; lng: number }> = {
  'Cape Verde': { lat: 16.0, lng: -24.0 },
  'Curaçao': { lat: 12.2, lng: -69.0 },
};

export interface WorldCupNationPoint {
  lat: number;
  lng: number;
  name: string;
}

export interface WorldCupStatus {
  /** geojson ADMIN names of the hosts (gold). */
  hostAdmins: string[];
  /** geojson ADMIN names of the officially qualified (green), excluding hosts. */
  qualifiedAdmins: string[];
  /** qualified nations without a 110m polygon, shown as green points. */
  qualifiedPoints: WorldCupNationPoint[];
  /** total verified qualified teams (incl. hosts) — 0 if the source was unreachable. */
  qualifiedCount: number;
}

const HOSTS_ONLY: WorldCupStatus = {
  hostAdmins: [...WC_HOST_ADMINS],
  qualifiedAdmins: [],
  qualifiedPoints: [],
  qualifiedCount: 0,
};

/**
 * Derive the globe's country states from the real openfootball field. Cache-first
 * (revalidate 6h). NEVER throws — on any failure returns hosts-only (honest
 * degradation: we never invent qualified nations).
 */
export async function getWorldCupStatus(): Promise<WorldCupStatus> {
  try {
    const res = await fetch(OPENFOOTBALL_URL, { next: { revalidate: 21600 } });
    if (!res.ok) return HOSTS_ONLY;
    const data = (await res.json()) as { matches?: { team1?: string; team2?: string }[] };
    const names = new Set<string>();
    for (const m of data.matches ?? []) {
      if (isRealTeam(m.team1)) names.add(m.team1.trim());
      if (isRealTeam(m.team2)) names.add(m.team2.trim());
    }
    if (names.size === 0) return HOSTS_ONLY;

    const hosts = new Set<string>(WC_HOST_ADMINS);
    const qualified = new Set<string>();
    const qualifiedPoints: WorldCupNationPoint[] = [];
    for (const name of names) {
      const admin = NAME_TO_ADMIN[name] ?? name;
      if (hosts.has(admin)) continue;
      const noPoly = NO_POLYGON[name];
      if (noPoly) qualifiedPoints.push({ lat: noPoly.lat, lng: noPoly.lng, name });
      else qualified.add(admin);
    }
    return {
      hostAdmins: [...WC_HOST_ADMINS],
      qualifiedAdmins: [...qualified],
      qualifiedPoints,
      qualifiedCount: names.size,
    };
  } catch {
    return HOSTS_ONLY;
  }
}
