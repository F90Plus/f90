import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  fileURLToPath(new URL('../../../../supabase/migrations/20260605000004_predictions.sql', import.meta.url)),
  'utf8',
).toLowerCase();

describe('migration 0004 — predictions', () => {
  it('creates both tables', () => {
    expect(sql).toContain('create table public.fixtures');
    expect(sql).toContain('create table public.predictions');
  });
  it('enables RLS on both', () => {
    expect(sql).toContain('alter table public.fixtures enable row level security');
    expect(sql).toContain('alter table public.predictions enable row level security');
  });
  it('locks writes at kickoff (policy references kickoff_at > now())', () => {
    expect(sql).toMatch(/kickoff_at\s*>\s*now\(\)/);
  });
  it('keeps one prediction per user/fixture/kind', () => {
    expect(sql).toMatch(/unique\s*\(user_id,\s*fixture_id,\s*kind\)/);
  });
});
