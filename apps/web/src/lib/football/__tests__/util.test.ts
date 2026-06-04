import { describe, expect, it } from 'vitest';
import { isRealTeam, parseKickoffISO, timeLabelFrom } from '../util';

describe('isRealTeam', () => {
  it('accepts real nation names', () => {
    expect(isRealTeam('Brazil')).toBe(true);
    expect(isRealTeam('Bosnia & Herzegovina')).toBe(true);
    expect(isRealTeam('Curaçao')).toBe(true);
  });

  it('rejects knockout advancement codes and placeholders', () => {
    expect(isRealTeam('1A')).toBe(false);
    expect(isRealTeam('2B')).toBe(false);
    expect(isRealTeam('W73')).toBe(false);
    expect(isRealTeam('3A/B/C/D/F')).toBe(false);
    expect(isRealTeam('Winner Group A')).toBe(false);
    expect(isRealTeam('Runner-up')).toBe(false);
  });

  it('rejects empty / undefined', () => {
    expect(isRealTeam(undefined)).toBe(false);
    expect(isRealTeam('')).toBe(false);
  });
});

describe('parseKickoffISO', () => {
  it('converts local stadium time + UTC offset to a UTC instant', () => {
    // 13:00 at UTC-6 → 19:00 UTC
    expect(parseKickoffISO('2026-06-11', '13:00 UTC-6')).toBe('2026-06-11T19:00:00.000Z');
    // 12:00 at UTC-7 → 19:00 UTC
    expect(parseKickoffISO('2026-06-28', '12:00 UTC-7')).toBe('2026-06-28T19:00:00.000Z');
  });

  it('returns null without a date', () => {
    expect(parseKickoffISO(undefined, '13:00 UTC-6')).toBeNull();
  });
});

describe('timeLabelFrom', () => {
  it('extracts a zero-padded HH:MM label', () => {
    expect(timeLabelFrom('13:00 UTC-6')).toBe('13:00');
    expect(timeLabelFrom('9:05 UTC-4')).toBe('09:05');
  });

  it('returns null when there is no time', () => {
    expect(timeLabelFrom(undefined)).toBeNull();
  });
});
