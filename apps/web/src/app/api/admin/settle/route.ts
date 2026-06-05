/**
 * POST /api/admin/settle
 *
 * Ingests finished WC2026 results from openfootball and settles every prediction
 * on each finished fixture exactly once, awarding REAL points + Tokens F90.
 *
 * Flow (Supabase service-role client — bypasses RLS, admin only):
 *   1. Ingest results: fetch openfootball; for each match that now has a
 *      full-time score, UPDATE the matching `fixtures` row (home_goals,
 *      away_goals, status='final', updated_at). The fixture id is derived the
 *      SAME way the sync route does (fixtureId(home.code, away.code, dateISO)),
 *      so it matches the existing row.
 *   2. Settle: for each fixture that is now final AND still has unsettled
 *      predictions, call the SECURITY DEFINER `settle_fixture(p_fixture_id)`
 *      RPC. That RPC is atomic + idempotent (settled_at-is-null + FOR UPDATE),
 *      and routes every award through award_points / award_coins.
 *   3. Return { fixturesFinalized, predictionsSettled }.
 *
 * Security contract (identical to /api/admin/sync-fixtures):
 *   - Caller must supply the `x-admin-secret` header.
 *   - Compared to ADMIN_SYNC_SECRET with a timing-safe comparison.
 *   - If ADMIN_SYNC_SECRET is unset the endpoint returns 503 (fail-closed).
 *   - Mismatches return 401 with no detail.
 *   - Errors are logged server-side (structured stderr) but only a safe generic
 *     message is returned. No secrets, stack traces, or row data leak.
 */

import { timingSafeEqual } from 'node:crypto';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { OPENFOOTBALL_URL, type OFData, type OFMatch } from '@/lib/football/openfootball';
import { teamMeta } from '@/lib/football/teams';
import { isRealTeam } from '@/lib/football/util';
import { fixtureId } from '@/lib/football/fixtures';
import { resultFromMatch } from '@/features/predictions/settlement';

// Never cache admin mutation routes.
export const dynamic = 'force-dynamic';

/** A finished fixture's result, keyed by the deterministic fixtures.id. */
interface FinishedFixture {
  id: string;
  homeGoals: number;
  awayGoals: number;
}

/** Structured server-side log line; never returned to the caller. */
function logError(msg: string, err: unknown): void {
  process.stderr.write(
    JSON.stringify({ level: 'error', msg, err: String(err) }) + '\n',
  );
}

/**
 * Map raw openfootball matches → finished fixtures (id + final score).
 * Mirrors fixtures.ts id derivation so ids match existing rows; skips matches
 * that are not real group-stage teams, have no date, or are not yet played.
 */
function finishedFixturesFrom(matches: OFMatch[]): FinishedFixture[] {
  const out: FinishedFixture[] = [];
  for (const m of matches) {
    const dateISO = m.date ?? null;
    if (!dateISO) continue;
    if (!isRealTeam(m.team1) || !isRealTeam(m.team2)) continue;
    const result = resultFromMatch(m);
    if (!result) continue; // not played yet → not finalizable
    const home = teamMeta(m.team1);
    const away = teamMeta(m.team2);
    out.push({
      id: fixtureId(home.code, away.code, dateISO),
      homeGoals: result.homeGoals,
      awayGoals: result.awayGoals,
    });
  }
  return out;
}

export async function POST(request: NextRequest): Promise<Response> {
  // ── Guard: ADMIN_SYNC_SECRET must be configured ───────────────────────────
  const secret = process.env.ADMIN_SYNC_SECRET;
  if (!secret) {
    return Response.json(
      { error: 'Admin settle endpoint is not configured on this server.' },
      { status: 503 },
    );
  }

  // ── Guard: x-admin-secret header must match (timing-safe) ─────────────────
  const provided = request.headers.get('x-admin-secret') ?? '';
  const secretBuf = Buffer.from(secret, 'utf8');
  const providedBuf = Buffer.from(
    provided.padEnd(secret.length, '\0').slice(0, secret.length),
    'utf8',
  );
  const isMatch =
    provided.length === secret.length && timingSafeEqual(secretBuf, providedBuf);
  if (!isMatch) {
    return Response.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  // ── Fetch raw openfootball data + extract finished fixtures ───────────────
  let finished: FinishedFixture[];
  try {
    const res = await fetch(OPENFOOTBALL_URL, { cache: 'no-store' });
    if (!res.ok) {
      return Response.json(
        { error: 'Failed to fetch result source data.' },
        { status: 502 },
      );
    }
    const data = (await res.json()) as OFData;
    finished = finishedFixturesFrom(data.matches ?? []);
  } catch (err) {
    logError('settle: fetch/map failed', err);
    return Response.json({ error: 'Failed to fetch result data.' }, { status: 500 });
  }

  if (finished.length === 0) {
    return Response.json({ fixturesFinalized: 0, predictionsSettled: 0 });
  }

  const supabase = createAdminClient();

  // ── 1. Ingest results: finalize each finished fixture ─────────────────────
  // Per-fixture UPDATE (not upsert): we only finalize rows that already exist
  // from the sync job, and we write ONLY the result columns.
  const finalizedIds: string[] = [];
  for (const fx of finished) {
    try {
      const { data, error } = await supabase
        .from('fixtures')
        .update({
          home_goals: fx.homeGoals,
          away_goals: fx.awayGoals,
          status: 'final',
          updated_at: new Date().toISOString(),
        })
        .eq('id', fx.id)
        .select('id');
      if (error) {
        logError('settle: finalize update failed', error.message);
        return Response.json({ error: 'Failed to finalize fixtures.' }, { status: 500 });
      }
      // A 0-row update means the fixture was never synced — skip silently.
      if (data && data.length > 0) finalizedIds.push(fx.id);
    } catch (err) {
      logError('settle: finalize exception', err);
      return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
  }

  // ── 2. Settle predictions on each finalized fixture (atomic + idempotent) ──
  let predictionsSettled = 0;
  for (const id of finalizedIds) {
    try {
      const { data, error } = await supabase.rpc('settle_fixture', { p_fixture_id: id });
      if (error) {
        logError('settle: settle_fixture rpc failed', error.message);
        return Response.json({ error: 'Failed to settle predictions.' }, { status: 500 });
      }
      // settle_fixture returns the count of predictions it settled this call.
      predictionsSettled += typeof data === 'number' ? data : 0;
    } catch (err) {
      logError('settle: settle_fixture exception', err);
      return Response.json({ error: 'Internal server error.' }, { status: 500 });
    }
  }

  return Response.json({
    fixturesFinalized: finalizedIds.length,
    predictionsSettled,
  });
}
