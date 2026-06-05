/**
 * Pure mapper: openfootball OFMatch → fixtures table row (with model probabilities).
 *
 * No I/O. Consumers:
 *   - The admin sync endpoint (POST /api/admin/sync-fixtures) upserts the rows.
 *   - Tests can exercise the mapper in full isolation.
 *
 * Deliberately depends only on the existing lib/football primitives — the Elo model,
 * team metadata, and parsing helpers are NOT re-implemented here.
 */

import type { OFMatch } from './openfootball';
import { teamMeta } from './teams';
import { homeAdvantageFor, modelProbability } from './model';
import { isRealTeam, parseKickoffISO } from './util';

/**
 * A row ready for upsert into the `public.fixtures` table.
 * Matches the columns of migration 0004 exactly. `home_goals` / `away_goals`
 * are omitted here (the sync endpoint only writes the schedule, not results).
 */
export interface FixtureRow {
  id: string;
  group_label: string | null;
  kickoff_at: string | null;
  home_code: string;
  away_code: string;
  prob_home: number;
  prob_draw: number;
  prob_away: number;
  status: 'upcoming';
  source: 'openfootball';
}

/**
 * Deterministic, slug-safe fixture id built from the two team codes + the date string.
 * e.g. fixtureId('MEX', 'RSA', '2026-06-11') → 'mex-rsa-2026-06-11'
 * Stable across calls; safe to use as a Postgres primary key.
 */
export function fixtureId(homeCode: string, awayCode: string, dateISO: string): string {
  return `${homeCode.toLowerCase()}-${awayCode.toLowerCase()}-${dateISO}`;
}

/**
 * Maps ONE openfootball group-stage match to a `FixtureRow`.
 * Returns `null` for:
 *   - Knockout placeholders ("1A", "Winner Group A", …) — detected via `isRealTeam`.
 *   - Matches where either team is missing.
 *
 * Probabilities are computed via the same Elo model the Copilot engine uses;
 * host nations (USA / Canada / Mexico) receive the documented home-advantage bump.
 */
export function toFixtureRow(m: OFMatch): FixtureRow | null {
  if (!isRealTeam(m.team1) || !isRealTeam(m.team2)) return null;

  const home = teamMeta(m.team1);
  const away = teamMeta(m.team2);
  const ha = homeAdvantageFor(m.team1);
  const prob = modelProbability(home.strength, away.strength, ha);

  const dateISO = m.date ?? null;

  // group_label: normalise "Group A" → "Group A" (preserve as-is; strip only if absent)
  const groupLabel =
    m.group != null && m.group.trim().length > 0
      ? m.group.trim().replace(/\s+/g, ' ')
      : null;

  const kickoffAt = parseKickoffISO(dateISO ?? undefined, m.time);

  // We can still insert a row without a kickoff (dateISO is null) — callers decide whether
  // to filter these out; the schema allows null after this function, but in practice all
  // group-stage matches in openfootball have a date. Return null if dateISO is absent since
  // the schema marks kickoff_at as NOT NULL.
  if (!dateISO) return null;

  return {
    id: fixtureId(home.code, away.code, dateISO),
    group_label: groupLabel,
    kickoff_at: kickoffAt,
    home_code: home.code,
    away_code: away.code,
    prob_home: prob.home,
    prob_draw: prob.draw,
    prob_away: prob.away,
    status: 'upcoming',
    source: 'openfootball',
  };
}
