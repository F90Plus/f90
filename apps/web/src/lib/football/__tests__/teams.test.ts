import { describe, expect, it } from 'vitest';
import { teamMeta, teamNameForCode } from '../teams';

/**
 * The real 2026 World Cup field (48 nations) — spelled exactly as openfootball
 * does, grouped A→L from the official Dec 5 2025 draw. This is the set the
 * Tournament Center renders, so every one of them must resolve to premium,
 * non-colliding metadata (no generic fallback).
 */
const WC2026_NATIONS = [
  // A
  'Mexico', 'South Africa', 'South Korea', 'Czech Republic',
  // B
  'Canada', 'Bosnia & Herzegovina', 'Qatar', 'Switzerland',
  // C
  'Brazil', 'Morocco', 'Haiti', 'Scotland',
  // D
  'USA', 'Paraguay', 'Australia', 'Turkey',
  // E
  'Germany', 'Curaçao', 'Ivory Coast', 'Ecuador',
  // F
  'Netherlands', 'Japan', 'Sweden', 'Tunisia',
  // G
  'Belgium', 'Egypt', 'Iran', 'New Zealand',
  // H
  'Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay',
  // I
  'France', 'Senegal', 'Iraq', 'Norway',
  // J
  'Argentina', 'Algeria', 'Austria', 'Jordan',
  // K
  'Portugal', 'DR Congo', 'Uzbekistan', 'Colombia',
  // L
  'England', 'Croatia', 'Ghana', 'Panama',
];

const GENERIC_ACCENT = '#828FB2';

describe('teamMeta — 2026 World Cup field', () => {
  it('covers exactly 48 nations', () => {
    expect(WC2026_NATIONS).toHaveLength(48);
  });

  it('resolves every nation to a unique 3-letter broadcast code', () => {
    const codes = WC2026_NATIONS.map((n) => teamMeta(n).code);
    for (const code of codes) {
      expect(code).toMatch(/^[A-Z]{3}$/);
    }
    const unique = new Set(codes);
    expect(unique.size).toBe(48);
  });

  it('gives every nation a real brand accent (never the generic fallback)', () => {
    for (const nation of WC2026_NATIONS) {
      expect(teamMeta(nation).accent).not.toBe(GENERIC_ACCENT);
    }
  });
});

describe('teamNameForCode — code → name bridge', () => {
  it('resolves known broadcast codes back to their canonical name', () => {
    expect(teamNameForCode('MEX')).toBe('Mexico');
    expect(teamNameForCode('RSA')).toBe('South Africa');
    expect(teamNameForCode('ARG')).toBe('Argentina');
    expect(teamNameForCode('ESP')).toBe('Spain');
  });

  it('is case-insensitive on the input code', () => {
    expect(teamNameForCode('mex')).toBe('Mexico');
  });

  it('returns null for an unknown code', () => {
    expect(teamNameForCode('ZZZ')).toBeNull();
  });

  it('round-trips with teamMeta for every nation in the field', () => {
    for (const name of WC2026_NATIONS) {
      const code = teamMeta(name).code;
      expect(teamNameForCode(code), name).toBe(name);
    }
  });
});
