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
 *
 * Deliberately omits `status`, `source`, `home_goals`, and `away_goals`:
 *   - `home_goals` / `away_goals` are results, not schedule data.
 *   - `status` / `source` are omitted so a re-sync UPDATE does NOT overwrite
 *     a settled fixture's status (e.g. 'final' → 'upcoming'). The DB column
 *     defaults ('upcoming' / 'openfootball') apply on INSERT for new rows;
 *     on conflict (UPDATE) supabase-js only writes the columns present here,
 *     so these fields are preserved in-place.
 *
 * Upserted columns: id, group_label, round, kickoff_at, home_code, away_code,
 * prob_home, prob_draw, prob_away, updated_at.
 */
export interface FixtureRow {
  id: string;
  group_label: string | null;
  round: string | null;
  kickoff_at: string | null;
  home_code: string;
  away_code: string;
  prob_home: number;
  prob_draw: number;
  prob_away: number;
  updated_at: string;
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
 *   - Matches with no date (kickoff_at is NOT NULL in the schema).
 *   - Knockout placeholders ("1A", "Winner Group A", …) — detected via `isRealTeam`.
 *   - Matches where either team is missing.
 *
 * Probabilities are computed via the same Elo model the Copilot engine uses;
 * host nations (USA / Canada / Mexico) receive the documented home-advantage bump.
 *
 * `status` and `source` are intentionally absent — the DB column defaults apply
 * on INSERT; on UPDATE (re-sync) these fields are preserved unchanged in the DB
 * so a re-sync cannot reset a settled fixture's status.
 */
export function toFixtureRow(m: OFMatch): FixtureRow | null {
  // Guard early: no date → cannot satisfy the NOT NULL kickoff_at constraint.
  // Placed first to avoid wasted work for dateless matches.
  const dateISO = m.date ?? null;
  if (!dateISO) return null;

  // Guard: reject knockout placeholders and missing teams.
  if (!isRealTeam(m.team1) || !isRealTeam(m.team2)) return null;

  const home = teamMeta(m.team1);
  const away = teamMeta(m.team2);
  const ha = homeAdvantageFor(m.team1);
  const prob = modelProbability(home.strength, away.strength, ha);

  // group_label: normalise "Group A" → "Group A" (preserve as-is; strip only if absent)
  const groupLabel =
    m.group != null && m.group.trim().length > 0
      ? m.group.trim().replace(/\s+/g, ' ')
      : null;

  // round: map from the openfootball match's optional round field.
  const round =
    m.round != null && m.round.trim().length > 0 ? m.round.trim() : null;

  const kickoffAt = parseKickoffISO(dateISO, m.time);

  return {
    id: fixtureId(home.code, away.code, dateISO),
    group_label: groupLabel,
    round,
    kickoff_at: kickoffAt,
    home_code: home.code,
    away_code: away.code,
    prob_home: prob.home,
    prob_draw: prob.draw,
    prob_away: prob.away,
    updated_at: new Date().toISOString(),
  };
}
