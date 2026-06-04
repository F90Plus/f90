import { describe, expect, it } from 'vitest';
import { flagAssetFor, NATION_ISO } from '../flags';
import { WC2026_NATIONS } from './wc2026-field';

describe('flags — 2026 field', () => {
  it('has a flag asset for every one of the 48 nations', () => {
    for (const nation of WC2026_NATIONS) {
      expect(flagAssetFor(nation), nation).not.toBeNull();
    }
  });

  it('uses lowercase ISO alpha-2 codes (or gb-xxx subdivisions)', () => {
    for (const nation of WC2026_NATIONS) {
      expect(NATION_ISO[nation], nation).toMatch(/^[a-z]{2}(-[a-z]{3})?$/);
    }
  });

  it('resolves to a public /flags asset path', () => {
    expect(flagAssetFor('Brazil')).toBe('/flags/br.svg');
    expect(flagAssetFor('England')).toBe('/flags/gb-eng.svg');
  });

  it('returns null for an unknown nation', () => {
    expect(flagAssetFor('Atlantis')).toBeNull();
  });
});
