/**
 * Own-IP avatar tokens (D-025) — a deterministic gradient + initial derived from
 * the handle, so every profile gets a distinct, brand-consistent identity disc
 * with zero external dependency and no licensed likeness. Pure + testable; the
 * profile page and the OG image both render from these.
 */

const PALETTE = [
  '#3d74ff', // led
  '#2fe6a0', // pitch
  '#ffc44d', // gold
  '#aef23a', // lime
  '#2bddf0', // volt
  '#ff8a3d', // amber
  '#74ace6', // sky
  '#f5483a', // flare
] as const;

/** FNV-1a — small, fast, stable across runs. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A deterministic two-colour gradient (always distinct) for a handle. */
export function avatarColors(seed: string): { from: string; to: string } {
  const h = hash(seed || 'f90');
  const fromIdx = h % PALETTE.length;
  const toIdx = (fromIdx + 1 + ((h >>> 5) % (PALETTE.length - 1))) % PALETTE.length;
  return { from: PALETTE[fromIdx]!, to: PALETTE[toIdx]! };
}

/** The disc glyph — the handle's first character, uppercased. */
export function avatarInitial(seed: string): string {
  const ch = seed.trim()[0];
  return ch ? ch.toUpperCase() : '?';
}
