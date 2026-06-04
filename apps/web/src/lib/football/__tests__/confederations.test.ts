import { describe, expect, it } from 'vitest';
import { CONFEDERATION_BY_NATION, confederationOf, type Confederation } from '../confederations';
import { WC2026_NATIONS } from './wc2026-field';

/**
 * Membership counts present at the 2026 World Cup (NOT the direct-slot allocation —
 * playoff winners shift the totals: e.g. CAF has 9 direct slots but 10 members here).
 */
const EXPECTED_MEMBERSHIP: Record<Confederation, number> = {
  UEFA: 16,
  CONMEBOL: 6,
  CONCACAF: 6,
  CAF: 10,
  AFC: 9,
  OFC: 1,
};

describe('confederations — 2026 field', () => {
  it('maps every one of the 48 nations to a confederation', () => {
    for (const nation of WC2026_NATIONS) {
      expect(confederationOf(nation), nation).not.toBeNull();
    }
  });

  it('matches the real confederation membership distribution', () => {
    const counts = {} as Record<Confederation, number>;
    for (const nation of WC2026_NATIONS) {
      const conf = confederationOf(nation)!;
      counts[conf] = (counts[conf] ?? 0) + 1;
    }
    expect(counts).toEqual(EXPECTED_MEMBERSHIP);
  });

  it('has no stray mappings beyond the 48 nations', () => {
    expect(Object.keys(CONFEDERATION_BY_NATION)).toHaveLength(48);
  });
});
