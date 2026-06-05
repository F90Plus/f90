/**
 * POST /api/admin/sync-fixtures
 *
 * Fetches the WC2026 group-stage schedule from openfootball, maps each match
 * to a fixture row (with model probabilities), and upserts into `public.fixtures`
 * via the Supabase service-role client (bypasses RLS — admin only).
 *
 * Security contract:
 *   - Caller must supply the `x-admin-secret` header.
 *   - The value is compared to ADMIN_SYNC_SECRET using a timing-safe comparison
 *     so brute-force timing attacks are not feasible.
 *   - If ADMIN_SYNC_SECRET is unset the endpoint returns 503 (fail-closed).
 *   - Mismatches return 401 with no detail.
 *   - Errors are logged server-side but only a safe generic message is returned.
 *
 * No secrets, stack traces, or row data are included in error responses.
 */

import { timingSafeEqual } from 'node:crypto';
import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { OPENFOOTBALL_URL, type OFData } from '@/lib/football/openfootball';
import { toFixtureRow } from '@/lib/football/fixtures';
import type { FixtureRow } from '@/lib/football/fixtures';

// Never cache admin mutation routes.
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest): Promise<Response> {
  // ── Guard: ADMIN_SYNC_SECRET must be configured ───────────────────────────
  const secret = process.env.ADMIN_SYNC_SECRET;
  if (!secret) {
    return Response.json(
      { error: 'Admin sync endpoint is not configured on this server.' },
      { status: 503 },
    );
  }

  // ── Guard: x-admin-secret header must match ───────────────────────────────
  const provided = request.headers.get('x-admin-secret') ?? '';

  // Timing-safe comparison: pad or truncate to equal lengths before comparing
  // so the comparison time is constant regardless of prefix matches.
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

  // ── Fetch raw openfootball data + map to fixture rows ─────────────────────
  let rows: FixtureRow[];
  try {
    // Fetch without Next.js cache (admin mutation: always fresh).
    const res = await fetch(OPENFOOTBALL_URL, { cache: 'no-store' });
    if (!res.ok) {
      return Response.json(
        { error: 'Failed to fetch fixture source data.' },
        { status: 502 },
      );
    }
    const data = (await res.json()) as OFData;
    rows = (data.matches ?? [])
      .map(toFixtureRow)
      .filter((r): r is FixtureRow => r !== null);
  } catch (err) {
    // Log server-side (structured); never expose to the caller.
    process.stderr.write(
      JSON.stringify({
        level: 'error',
        msg: 'sync-fixtures: fetch/map failed',
        err: String(err),
      }) + '\n',
    );
    return Response.json({ error: 'Failed to fetch fixture data.' }, { status: 500 });
  }

  if (rows.length === 0) {
    return Response.json({
      synced: 0,
      note: 'No group-stage fixtures found in source data.',
    });
  }

  // ── Upsert into Supabase ──────────────────────────────────────────────────
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('fixtures').upsert(rows, { onConflict: 'id' });
    if (error) {
      process.stderr.write(
        JSON.stringify({
          level: 'error',
          msg: 'sync-fixtures: upsert failed',
          err: error.message,
        }) + '\n',
      );
      return Response.json({ error: 'Failed to persist fixtures.' }, { status: 500 });
    }
  } catch (err) {
    process.stderr.write(
      JSON.stringify({
        level: 'error',
        msg: 'sync-fixtures: admin client error',
        err: String(err),
      }) + '\n',
    );
    return Response.json({ error: 'Internal server error.' }, { status: 500 });
  }

  return Response.json({ synced: rows.length });
}
