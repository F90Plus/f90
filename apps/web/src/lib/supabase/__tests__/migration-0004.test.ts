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
  it('creates the prediction_kind enum (not assumed to pre-exist)', () => {
    expect(sql).toMatch(/create type prediction_kind as enum/);
  });
  it('exposes make_prediction as a SECURITY DEFINER rpc', () => {
    expect(sql).toContain('create or replace function public.make_prediction');
    expect(sql).toContain('security definer');
  });
  it('grants execute on make_prediction so it is callable', () => {
    expect(sql).toContain('grant execute on function public.make_prediction');
  });
  it('does NOT let clients write predictions directly (no insert/update grant)', () => {
    expect(sql).not.toMatch(/grant\s+insert\s+on\s+public\.predictions\s+to\s+authenticated/);
    expect(sql).not.toMatch(/grant\s+update\s+on\s+public\.predictions\s+to\s+authenticated/);
  });
  it('carries model probabilities on fixtures', () => {
    expect(sql).toContain('prob_home');
  });
});
