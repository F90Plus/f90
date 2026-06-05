import { describe, expect, it } from 'vitest';
import { parseOutcome } from '../validation';

describe('parseOutcome', () => {
  it('accepts "home"', () => {
    expect(parseOutcome('home')).toBe('home');
  });

  it('accepts "draw"', () => {
    expect(parseOutcome('draw')).toBe('draw');
  });

  it('accepts "away"', () => {
    expect(parseOutcome('away')).toBe('away');
  });

  it('rejects "win" (not a valid outcome)', () => {
    expect(() => parseOutcome('win')).toThrow();
  });

  it('rejects an empty string', () => {
    expect(() => parseOutcome('')).toThrow();
  });

  it('rejects undefined', () => {
    expect(() => parseOutcome(undefined)).toThrow();
  });

  it('rejects uppercase "HOME" (case-sensitive)', () => {
    expect(() => parseOutcome('HOME')).toThrow();
  });

  it('rejects null', () => {
    expect(() => parseOutcome(null)).toThrow();
  });

  it('rejects a number', () => {
    expect(() => parseOutcome(1)).toThrow();
  });
});
