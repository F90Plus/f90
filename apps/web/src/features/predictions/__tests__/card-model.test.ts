import { describe, expect, it } from 'vitest';
import { stanceOf, ticketView, readMarkerPct } from '../card-model';
import { coinsForPoints } from '@/lib/scoring';
import type { PredictableFixture } from '../queries';

// ---------------------------------------------------------------------------
// Shared fixture stub (MEX vs RSA — lean = home, mirrors the mock)
// ---------------------------------------------------------------------------

const fixture: PredictableFixture = {
  id: 'mex-rsa-2026-06-11',
  groupLabel: 'Group A',
  round: 'Group Stage',
  kickoffISO: '2026-06-11T18:00:00Z',
  homeCode: 'MEX',
  awayCode: 'RSA',
  prob: { home: 0.53, draw: 0.26, away: 0.21 },
  points: { home: 38, draw: 77, away: 95 },
  lean: 'home',
  userPick: null,
};

// ---------------------------------------------------------------------------
// stanceOf
// ---------------------------------------------------------------------------

describe('stanceOf', () => {
  it('is consensus when the pick matches the Analyst lean', () => {
    expect(stanceOf('home', 'home')).toBe('consensus');
    expect(stanceOf('draw', 'draw')).toBe('consensus');
    expect(stanceOf('away', 'away')).toBe('consensus');
  });

  it('is contrarian when the pick differs from the lean', () => {
    expect(stanceOf('away', 'home')).toBe('contrarian');
    expect(stanceOf('draw', 'home')).toBe('contrarian');
    expect(stanceOf('home', 'away')).toBe('contrarian');
  });
});

// ---------------------------------------------------------------------------
// readMarkerPct — the "TÚ" marker sits at the CENTRE of the picked segment
// ---------------------------------------------------------------------------

describe('readMarkerPct', () => {
  it('places the home marker at the centre of the home segment', () => {
    // home segment spans 0..53% → centre 26.5%
    expect(readMarkerPct(fixture.prob, 'home')).toBeCloseTo(26.5, 5);
  });

  it('places the draw marker at the centre of the draw segment', () => {
    // home 53% + draw/2 (13%) = 66%
    expect(readMarkerPct(fixture.prob, 'draw')).toBeCloseTo(66, 5);
  });

  it('places the away marker at the centre of the away segment', () => {
    // home 53% + draw 26% + away/2 (10.5%) = 89.5%
    expect(readMarkerPct(fixture.prob, 'away')).toBeCloseTo(89.5, 5);
  });

  it('normalises probabilities that do not sum to exactly 1', () => {
    // 0.5/0.3/0.2 already sums to 1; use a non-normalised set
    const prob = { home: 0.6, draw: 0.3, away: 0.3 }; // sum 1.2
    // home% = 50, draw% = 25, away% = 25 → home centre = 25
    expect(readMarkerPct(prob, 'home')).toBeCloseTo(25, 5);
  });

  it('is clamped within 0..100 and never NaN for degenerate input', () => {
    const prob = { home: 0, draw: 0, away: 0 };
    const m = readMarkerPct(prob, 'home');
    expect(Number.isFinite(m)).toBe(true);
    expect(m).toBeGreaterThanOrEqual(0);
    expect(m).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// ticketView
// ---------------------------------------------------------------------------

describe('ticketView', () => {
  it('derives a consensus ticket when picking the lean', () => {
    const v = ticketView(fixture, 'home');
    expect(v.pick).toBe('home');
    expect(v.stance).toBe('consensus');
    expect(v.points).toBe(38);
    expect(v.coins).toBe(coinsForPoints(38));
    expect(v.readMarkerPct).toBeCloseTo(26.5, 5);
  });

  it('derives a contrarian ticket when challenging the lean', () => {
    const v = ticketView(fixture, 'away');
    expect(v.pick).toBe('away');
    expect(v.stance).toBe('contrarian');
    expect(v.points).toBe(95);
    expect(v.coins).toBe(coinsForPoints(95));
    expect(v.readMarkerPct).toBeCloseTo(89.5, 5);
  });

  it('uses the points already computed on the fixture (display twin of the SQL)', () => {
    expect(ticketView(fixture, 'draw').points).toBe(fixture.points.draw);
  });
});
