import { describe, expect, it } from 'vitest';
import { markets, marketDirection, sparkPath } from '@/data/markets';

describe('marketDirection', () => {
  it('treats a positive or zero delta as up', () => {
    expect(marketDirection(8.2)).toBe('up');
    expect(marketDirection(0)).toBe('up');
  });
  it('treats a negative delta as down', () => {
    expect(marketDirection(-2.4)).toBe('down');
  });
});

describe('sparkPath', () => {
  it('returns an empty string for an empty series', () => {
    expect(sparkPath([], 100, 30)).toBe('');
  });

  it('maps the min to the bottom and the max to the top (y inverted)', () => {
    // two points, no padding: x spans 0→width, value 0→y=height, value 1→y=0
    expect(sparkPath([0, 1], 10, 10, 0)).toBe('0,10 10,0');
  });

  it('flattens a constant series to the vertical centre', () => {
    expect(sparkPath([5, 5, 5], 20, 10, 0)).toBe('0,5 10,5 20,5');
  });

  it('emits one point per value, evenly spaced on x', () => {
    const pts = sparkPath([1, 2, 3, 4, 5], 100, 30).split(' ');
    expect(pts).toHaveLength(5);
    const xs = pts.map((p) => Number(p.split(',')[0]));
    // strictly increasing x
    for (let i = 1; i < xs.length; i++) expect(xs[i]).toBeGreaterThan(xs[i - 1]!);
  });

  it('respects vertical padding so the stroke never clips the box edge', () => {
    const pts = sparkPath([0, 100], 50, 20, 2).split(' ');
    const ys = pts.map((p) => Number(p.split(',')[1]));
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...ys)).toBeLessThanOrEqual(18);
  });
});

describe('markets data integrity', () => {
  it('keeps every chance as a probability in [0, 100] (never odds — D-037)', () => {
    for (const m of markets) {
      expect(m.chance).toBeGreaterThanOrEqual(0);
      expect(m.chance).toBeLessThanOrEqual(100);
    }
  });

  it('gives each market a trend series that ends at its current chance', () => {
    for (const m of markets) {
      expect(m.spark.length).toBeGreaterThanOrEqual(2);
      expect(m.spark.at(-1)).toBe(m.chance);
      for (const v of m.spark) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      }
    }
  });

  it('attaches a positive predictor count (collective-intelligence signal)', () => {
    for (const m of markets) expect(m.predictors).toBeGreaterThan(0);
  });

  it('flags exactly one market as the Analyst’s detected opportunity', () => {
    const featured = markets.filter((m) => m.featured);
    expect(featured).toHaveLength(1);
    expect(featured[0]!.edge).toBeGreaterThan(0);
  });
});
