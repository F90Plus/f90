import { describe, expect, it } from 'vitest';
import { avatarColors, avatarInitial } from '../avatar';

describe('avatarColors', () => {
  it('is deterministic for a given seed', () => {
    expect(avatarColors('messi_10')).toEqual(avatarColors('messi_10'));
  });

  it('returns two distinct hex colours from the palette', () => {
    const { from, to } = avatarColors('messi_10');
    expect(from).toMatch(/^#[0-9a-f]{6}$/i);
    expect(to).toMatch(/^#[0-9a-f]{6}$/i);
    expect(from).not.toBe(to);
  });

  it('varies across different seeds', () => {
    const a = avatarColors('a_user');
    const b = avatarColors('z_user');
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });

  it('never throws on empty input', () => {
    expect(() => avatarColors('')).not.toThrow();
  });
});

describe('avatarInitial', () => {
  it('uppercases the first character', () => {
    expect(avatarInitial('messi_10')).toBe('M');
  });

  it('falls back to a stable glyph for empty input', () => {
    expect(avatarInitial('')).toBe('?');
  });
});
