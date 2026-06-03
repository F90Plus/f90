import type { ProbTriplet } from '@/lib/copilot/model';

const DRAW_BASE = 0.26;

/**
 * Model-derived outcome probability from two internal strength ratings + home
 * advantage. This is the F90+ model's view (not bookmaker odds) — honest for a
 * prediction product. Same Elo logistic the Copilot engine uses.
 */
export function modelProbability(
  homeStrength: number,
  awayStrength: number,
  homeAdvantage = 0.2,
): ProbTriplet {
  const d = homeStrength - awayStrength + 70 * homeAdvantage;
  const eHome = 1 / (1 + Math.pow(10, -d / 400));
  return {
    home: eHome * (1 - DRAW_BASE),
    draw: DRAW_BASE,
    away: (1 - eHome) * (1 - DRAW_BASE),
  };
}

/** Host nations get a real home-advantage bump; everyone else is neutral-venue. */
const HOSTS = new Set(['Mexico', 'USA', 'Canada']);

export function homeAdvantageFor(homeName: string): number {
  return HOSTS.has(homeName) ? 0.4 : 0.05;
}
