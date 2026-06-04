import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TEAMS } from '../teams';

/**
 * Guards that the SQL countries seed stays in sync with teams.ts — the single
 * source of truth for the 48-nation field. If someone changes a code/strength in
 * teams.ts (or adds a nation) without updating the seed, this fails.
 */
const here = dirname(fileURLToPath(import.meta.url));
const seedPath = join(here, '../../../../supabase/migrations/20260604000002_countries_seed.sql');
const sql = readFileSync(seedPath, 'utf8');

const rowRe =
  /\(\s*'([A-Z]{2,3})'\s*,\s*'((?:[^']|'')*)'\s*,\s*'((?:[^']|'')*)'\s*,\s*'(#[0-9A-Fa-f]{6})'\s*,\s*(true|false)\s*,\s*(true|false)\s*,\s*(\d+)\s*\)/g;

const rows = [...sql.matchAll(rowRe)].map((m) => ({
  code: m[1]!,
  name_en: m[2]!,
  name_es: m[3]!,
  accent: m[4]!,
  is_host: m[5] === 'true',
  is_qualified: m[6] === 'true',
  strength: Number(m[7]),
}));

describe('countries seed', () => {
  it('has exactly one row per nation in teams.ts (48)', () => {
    expect(rows.length).toBe(Object.keys(TEAMS).length);
  });

  it('uses unique country codes', () => {
    const codes = rows.map((r) => r.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('matches teams.ts code + strength for every nation', () => {
    const byCode = new Map(rows.map((r) => [r.code, r]));
    for (const [name, meta] of Object.entries(TEAMS)) {
      const row = byCode.get(meta.code);
      expect(row, `seed missing ${name} (${meta.code})`).toBeTruthy();
      expect(row!.strength, `strength mismatch for ${name}`).toBe(meta.strength);
    }
  });

  it('marks exactly the three hosts (USA, Mexico, Canada)', () => {
    const hosts = rows
      .filter((r) => r.is_host)
      .map((r) => r.code)
      .sort();
    expect(hosts).toEqual(['CAN', 'MEX', 'USA']);
  });

  it('marks every nation as qualified and gives each a Spanish name', () => {
    for (const r of rows) {
      expect(r.is_qualified, `${r.code} not qualified`).toBe(true);
      expect(r.name_es.length, `${r.code} missing name_es`).toBeGreaterThan(0);
    }
  });
});
