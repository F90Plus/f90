import { describe, expect, it } from 'vitest';
import {
  localePathname,
  parseEmail,
  postAuthRedirectPath,
  resolveSafeNext,
} from '../validation';

describe('parseEmail', () => {
  it('accepts a valid email and normalises it (trim + lowercase)', () => {
    expect(parseEmail('  Fan@F90.XYZ ')).toEqual({ ok: true, email: 'fan@f90.xyz' });
  });

  it('rejects a malformed email with a stable error key', () => {
    expect(parseEmail('not-an-email')).toEqual({ ok: false, error: 'invalidEmail' });
  });

  it('rejects an empty string', () => {
    expect(parseEmail('')).toEqual({ ok: false, error: 'invalidEmail' });
  });

  it('rejects non-string input (e.g. a missing FormData field)', () => {
    expect(parseEmail(null)).toEqual({ ok: false, error: 'invalidEmail' });
    expect(parseEmail(undefined)).toEqual({ ok: false, error: 'invalidEmail' });
  });
});

describe('resolveSafeNext', () => {
  it('keeps an internal absolute path', () => {
    expect(resolveSafeNext('/onboarding')).toBe('/onboarding');
    expect(resolveSafeNext('/u/messi?tab=stats')).toBe('/u/messi?tab=stats');
  });

  it('falls back to "/" when missing or empty', () => {
    expect(resolveSafeNext(null)).toBe('/');
    expect(resolveSafeNext(undefined)).toBe('/');
    expect(resolveSafeNext('')).toBe('/');
  });

  it('blocks open-redirect vectors', () => {
    expect(resolveSafeNext('https://evil.com')).toBe('/'); // absolute external
    expect(resolveSafeNext('//evil.com')).toBe('/'); // protocol-relative
    expect(resolveSafeNext('/\\evil.com')).toBe('/'); // backslash trick
    expect(resolveSafeNext('\\/evil.com')).toBe('/'); // leading backslash
    expect(resolveSafeNext('javascript:alert(1)')).toBe('/'); // scheme, no leading slash
    expect(resolveSafeNext('/foo\nbar')).toBe('/'); // control char
  });
});

describe('localePathname', () => {
  it('does NOT prefix the default locale (as-needed)', () => {
    expect(localePathname('es', '/onboarding')).toBe('/onboarding');
    expect(localePathname('es', '/')).toBe('/');
  });

  it('prefixes non-default locales', () => {
    expect(localePathname('en', '/onboarding')).toBe('/en/onboarding');
    expect(localePathname('en', '/')).toBe('/en');
  });

  it('leaves unknown locales unprefixed (safe default)', () => {
    expect(localePathname('fr', '/onboarding')).toBe('/onboarding');
  });
});

describe('postAuthRedirectPath', () => {
  it('localises a safe next path', () => {
    expect(postAuthRedirectPath('en', '/onboarding')).toBe('/en/onboarding');
    expect(postAuthRedirectPath('es', '/onboarding')).toBe('/onboarding');
  });

  it('sanitises a hostile next before localising', () => {
    expect(postAuthRedirectPath('en', 'https://evil.com')).toBe('/en');
    expect(postAuthRedirectPath('es', '//evil.com')).toBe('/');
  });
});
