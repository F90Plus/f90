import type { Outcome, ProbTriplet } from '../model';

export const EPS = 1e-6;

export function clamp(x: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, x));
}

export function round2(x: number): number {
  return Math.round(x * 100) / 100;
}

export function normalizeTriplet(t: ProbTriplet): ProbTriplet {
  const sum = t.home + t.draw + t.away;
  if (sum <= 0) return { home: 1 / 3, draw: 1 / 3, away: 1 / 3 };
  return { home: t.home / sum, draw: t.draw / sum, away: t.away / sum };
}

export function getOutcome(t: ProbTriplet, o: Outcome): number {
  return o === 'home' ? t.home : o === 'away' ? t.away : t.draw;
}

export function argmaxOutcome(t: ProbTriplet): Outcome {
  if (t.home >= t.draw && t.home >= t.away) return 'home';
  if (t.away >= t.draw && t.away >= t.home) return 'away';
  return 'draw';
}

/** Logistic curve mapping any real number into (0, 1). */
export function logistic(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function poissonPmf(k: number, lambda: number): number {
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / factorial(k);
}

/**
 * Outcome distribution from two expected-goal rates via independent Poisson over a
 * scoreline grid. Underpins the quality/xG-proxy signal.
 */
export function poissonTriplet(lambdaHome: number, lambdaAway: number, maxGoals = 7): ProbTriplet {
  let home = 0;
  let draw = 0;
  let away = 0;
  for (let i = 0; i <= maxGoals; i++) {
    const pi = poissonPmf(i, lambdaHome);
    for (let j = 0; j <= maxGoals; j++) {
      const p = pi * poissonPmf(j, lambdaAway);
      if (i > j) home += p;
      else if (i < j) away += p;
      else draw += p;
    }
  }
  return normalizeTriplet({ home, draw, away });
}
