/**
 * Global rankings read surface (Phase 1, T9). Replaces the fabricated
 * `data/leaderboard.ts` mock with a real, preview-safe read of the
 * `global_rankings` view (T2). Before Phase 2 scoring everyone sits at 0 points,
 * so the teaser reads as an honest empty-state ("the board opens when
 * predictions start") rather than a wall of zero-point rows or fake names.
 *
 * The logic is split for testability: `toTeaserEntries` is pure (unit-tested);
 * `getGlobalRankings` is the thin Supabase adapter (verified in the browser).
 */

import { createPublicClient } from '@/lib/supabase/public';
import { flagAssetFor } from '@/lib/football/flags';

/** A row from the `global_rankings` view (security_invoker, world-readable). */
export interface RankingRow {
  rank: number;
  username: string;
  display_name: string | null;
  country_code: string | null;
  total_points: number;
}

/** A leaderboard-teaser entry, shaped for the homepage board. */
export interface RankingEntry {
  rank: number;
  username: string;
  displayName: string | null;
  points: number;
  countryCode: string | null;
  /** Vendored nation flag asset, or null → the row falls back to the avatar token. */
  flag: string | null;
}

/**
 * Project raw view rows into teaser entries. Pure + deterministic.
 *
 * Only ranked players (points > 0) make the board: pre-Phase-2 everyone is at 0,
 * so this yields `[]` and the UI shows its empty-state — honest, never a fake
 * leaderboard (the F90+ no-fabricated-data rule). `flagByCode` is injected
 * (built from the `countries` seed) so this unit carries no asset-module
 * coupling. Rows are assumed pre-sorted by the view (rank asc / points desc).
 */
export function toTeaserEntries(
  rows: RankingRow[],
  flagByCode: Map<string, string | null>,
  limit: number,
): RankingEntry[] {
  return rows
    .filter((r) => r.total_points > 0)
    .slice(0, limit)
    .map((r) => ({
      rank: r.rank,
      username: r.username,
      displayName: r.display_name ?? null,
      points: r.total_points,
      countryCode: r.country_code ?? null,
      flag: r.country_code ? (flagByCode.get(r.country_code) ?? null) : null,
    }));
}

/**
 * The top of the global board for the homepage teaser. Reads the real
 * `global_rankings` view as the anon role (world-readable) through the
 * cookie-less public client, then projects via `toTeaserEntries`.
 *
 * Preview-safe: with no Supabase env the client is null → `[]` (empty board).
 * Returns `[]` until at least one player has scored (Phase 2), so the UI shows
 * its honest empty-state instead of a fake or all-zero leaderboard.
 */
export async function getGlobalRankings(limit = 5): Promise<RankingEntry[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data: rows, error } = await supabase
    .from('global_rankings')
    .select('rank, username, display_name, country_code, total_points')
    .order('total_points', { ascending: false })
    .order('username', { ascending: true })
    .limit(limit);

  if (error || !rows || rows.length === 0) return [];

  // One extra public read for flags — only reached once players are on the board.
  const { data: countries } = await supabase
    .from('countries')
    .select('code, name_en')
    .returns<{ code: string; name_en: string }[]>();
  const flagByCode = new Map<string, string | null>(
    (countries ?? []).map((c) => [c.code, flagAssetFor(c.name_en)]),
  );

  return toTeaserEntries(rows as RankingRow[], flagByCode, limit);
}
