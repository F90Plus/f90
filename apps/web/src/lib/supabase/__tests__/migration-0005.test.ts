import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  fileURLToPath(new URL('../../../../supabase/migrations/20260605000005_settlement.sql', import.meta.url)),
  'utf8',
).toLowerCase();

describe('migration 0005 — settlement', () => {
  it('creates settle_fixture(text) returning integer', () => {
    expect(sql).toContain('create or replace function public.settle_fixture(p_fixture_id text)');
    expect(sql).toMatch(/returns\s+integer/);
  });

  it('is SECURITY DEFINER with a pinned search_path', () => {
    expect(sql).toContain('security definer');
    expect(sql).toMatch(/set search_path\s*=\s*public/);
  });

  it('grants execute ONLY to service_role', () => {
    expect(sql).toContain('grant execute on function public.settle_fixture(text) to service_role');
  });

  it('revokes execute from public/anon/authenticated (no client can settle)', () => {
    expect(sql).toContain('revoke all on function public.settle_fixture(text) from public');
    expect(sql).toContain('revoke all on function public.settle_fixture(text) from anon');
    expect(sql).toContain('revoke all on function public.settle_fixture(text) from authenticated');
    // Never grant it to a client role.
    expect(sql).not.toMatch(/grant\s+execute\s+on\s+function\s+public\.settle_fixture\(text\)\s+to\s+(anon|authenticated|public)/);
  });

  it('only processes unsettled picks (idempotency guard)', () => {
    expect(sql).toMatch(/settled_at\s+is\s+null/);
  });

  it('row-locks the picks it settles (FOR UPDATE — concurrency-safe)', () => {
    expect(sql).toMatch(/for\s+update/);
  });

  it('routes ALL awards through the economy functions (no direct balance write)', () => {
    expect(sql).toContain('award_points');
    expect(sql).toContain('award_coins');
    // settlement must NOT touch wallets/profiles/ledgers directly — only award_* do.
    expect(sql).not.toMatch(/update\s+public\.wallets/);
    expect(sql).not.toMatch(/update\s+public\.profiles/);
    expect(sql).not.toMatch(/insert\s+into\s+public\.coin_ledger/);
    expect(sql).not.toMatch(/insert\s+into\s+public\.score_ledger/);
  });

  it('awards coins with the prediction_reward ledger kind', () => {
    expect(sql).toContain("'prediction_reward'");
  });

  it('requires the fixture to be final with both scores before settling', () => {
    expect(sql).toMatch(/status\s*<>\s*'final'/);
    expect(sql).toMatch(/home_goals\s+is\s+null/);
    expect(sql).toMatch(/away_goals\s+is\s+null/);
  });

  it('marks each processed pick settled (stamps settled_at)', () => {
    expect(sql).toMatch(/set\s+settled_at\s*=\s*now\(\)/);
  });
});
