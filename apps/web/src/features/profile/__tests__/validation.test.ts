import { describe, expect, it } from 'vitest';
import {
  isProfileComplete,
  parseCountryCode,
  parseUsername,
  RESERVED_USERNAMES,
} from '../validation';

describe('parseUsername', () => {
  it('accepts a valid handle and normalises it (trim + lowercase)', () => {
    expect(parseUsername('  Messi_10 ')).toEqual({ ok: true, username: 'messi_10' });
  });

  it('accepts the documented bounds (3–20, a-z0-9_)', () => {
    expect(parseUsername('abc')).toEqual({ ok: true, username: 'abc' });
    expect(parseUsername('a'.repeat(20))).toEqual({ ok: true, username: 'a'.repeat(20) });
  });

  it('rejects out-of-range lengths with usernameFormat', () => {
    expect(parseUsername('ab')).toEqual({ ok: false, error: 'usernameFormat' });
    expect(parseUsername('a'.repeat(21))).toEqual({ ok: false, error: 'usernameFormat' });
    expect(parseUsername('')).toEqual({ ok: false, error: 'usernameFormat' });
  });

  it('rejects illegal characters with usernameFormat', () => {
    expect(parseUsername('mes si')).toEqual({ ok: false, error: 'usernameFormat' });
    expect(parseUsername('messi!')).toEqual({ ok: false, error: 'usernameFormat' });
    expect(parseUsername('messí')).toEqual({ ok: false, error: 'usernameFormat' });
  });

  it('rejects non-string input', () => {
    expect(parseUsername(null)).toEqual({ ok: false, error: 'usernameFormat' });
    expect(parseUsername(undefined)).toEqual({ ok: false, error: 'usernameFormat' });
  });

  it('rejects reserved handles (case-insensitively) with usernameReserved', () => {
    expect(RESERVED_USERNAMES.has('admin')).toBe(true);
    expect(parseUsername('ADMIN')).toEqual({ ok: false, error: 'usernameReserved' });
    expect(parseUsername('Root')).toEqual({ ok: false, error: 'usernameReserved' });
  });
});

describe('isProfileComplete', () => {
  it('is complete only when the user chose a handle AND a country', () => {
    expect(isProfileComplete({ country_code: 'ESP', username_changed_at: '2026-06-04T00:00:00Z' })).toBe(true);
  });

  it('is incomplete straight after the trigger (no country, no handle change)', () => {
    expect(isProfileComplete({ country_code: null, username_changed_at: null })).toBe(false);
  });

  it('is incomplete if either piece is missing', () => {
    expect(isProfileComplete({ country_code: 'ESP', username_changed_at: null })).toBe(false);
    expect(isProfileComplete({ country_code: null, username_changed_at: '2026-06-04T00:00:00Z' })).toBe(false);
  });

  it('treats a missing profile as incomplete', () => {
    expect(isProfileComplete(null)).toBe(false);
  });
});

describe('parseCountryCode', () => {
  const valid = new Set(['ES', 'AR', 'BR']);

  it('accepts a code that exists in the allowed set', () => {
    expect(parseCountryCode('ES', valid)).toEqual({ ok: true, code: 'ES' });
  });

  it('rejects an unknown code', () => {
    expect(parseCountryCode('ZZ', valid)).toEqual({ ok: false, error: 'countryInvalid' });
  });

  it('rejects non-string / empty input', () => {
    expect(parseCountryCode(null, valid)).toEqual({ ok: false, error: 'countryInvalid' });
    expect(parseCountryCode('', valid)).toEqual({ ok: false, error: 'countryInvalid' });
  });
});
