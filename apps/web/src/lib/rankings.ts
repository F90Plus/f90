/**
 * Global rankings read surface (Phase 1, T9). Replaces the fabricated
 * `data/leaderboard.ts` mock with a real, preview-safe read of the
 * `global_rankings` view (T2). Before Phase 2 scoring everyone sits at 0 points,
 * so the teaser reads as an honest empty-state ("the board opens when
 * predictions start") rather than a wall of zero-point rows or fake names.
 *
 * The logic is split for testability: `toTeaserEntries` / `toPageEntries` /
 * `markCurrentUser` are pure (unit-tested); `getGlobalRankings` /
 * `getRankingPage` are thin Supabase adapters (verified in the browser).
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
 * A row from the `global_rankings` view including the user_id column, used by
 * the full /ranking page to identify the current user's entry.
 */
export interface RankingPageRow extends RankingRow {
  user_id: string;
}

/** A full-page leaderboard entry (superset of RankingEntry). */
export interface RankingPageEntry extends RankingEntry {
  userId: string;
  /** True when this row belongs to the currently logged-in user. */
  isCurrentUser: boolean;
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
 * Project raw view rows (with user_id) into full-page entries. Pure + deterministic.
 *
 * Keeps only players with points > 0 (same honesty rule as the teaser). Marks
 * the row whose user_id matches `currentUserId` so the page can highlight it.
 * `flagByCode` is injected for the same testability reason as `toTeaserEntries`.
 */
export function toPageEntries(
  rows: RankingPageRow[],
  flagByCode: Map<string, string | null>,
  limit: number,
  currentUserId: string | null,
): RankingPageEntry[] {
  return rows
    .filter((r) => r.total_points > 0)
    .slice(0, limit)
    .map((r) => ({
      rank: r.rank,
      userId: r.user_id,
      username: r.username,
      displayName: r.display_name ?? null,
      points: r.total_points,
      countryCode: r.country_code ?? null,
      flag: r.country_code ? (flagByCode.get(r.country_code) ?? null) : null,
      isCurrentUser: currentUserId != null && r.user_id === currentUserId,
    }));
}

/**
 * Mark the current user's entry in an already-projected list. Pure + deterministic.
 * Used when the page fetches the board with the anon client but has the user id
 * from the authenticated server context.
 */
export function markCurrentUser(
  entries: RankingEntry[],
  currentUserId: string | null,
  rowUserIds: string[],
): RankingPageEntry[] {
  return entries.map((e, i) => ({
    ...e,
    userId: rowUserIds[i] ?? '',
    isCurrentUser: currentUserId != null && rowUserIds[i] === currentUserId,
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

/**
 * The full global board for the /ranking page, up to `limit` scored players.
 * Uses the same public client as `getGlobalRankings` (world-readable, ISR-safe).
 * Also fetches user_id so the page can highlight the current user's row.
 *
 * Graceful-degrade: returns `[]` on any failure (missing env, DB error, empty
 * board) so the page never 500s — it just shows the honest empty-state.
 */
export async function getRankingPage(
  limit = 100,
  currentUserId: string | null = null,
): Promise<RankingPageEntry[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];

  const { data: rows, error } = await supabase
    .from('global_rankings')
    .select('user_id, rank, username, display_name, country_code, total_points')
    .gt('total_points', 0)
    .order('total_points', { ascending: false })
    .order('username', { ascending: true })
    .limit(limit);

  if (error || !rows || rows.length === 0) return [];

  const { data: countries } = await supabase
    .from('countries')
    .select('code, name_en')
    .returns<{ code: string; name_en: string }[]>();
  const flagByCode = new Map<string, string | null>(
    (countries ?? []).map((c) => [c.code, flagAssetFor(c.name_en)]),
  );

  return toPageEntries(rows as RankingPageRow[], flagByCode, limit, currentUserId);
}
