/**
 * Pure view-model helpers for the /predictions page.
 *
 * Separates the "active" group (pending + locked — awaiting kickoff or result)
 * from the "resolved" group (settled — result known, win or loss recorded).
 * Input is already newest-first (`getUserPredictions` orders by `created_at` desc).
 * Each group preserves the newest-first ordering of the input.
 *
 * Unit-tested in `__tests__/predictions-model.test.ts`.
 */

import type { UserPrediction } from './queries';

export interface PredictionsGroups {
  /** Predictions still awaiting kickoff (pending) or awaiting settlement (locked). */
  active: UserPrediction[];
  /** Predictions with a known result (settled), newest first. */
  resolved: UserPrediction[];
}

/**
 * Partition a list of UserPredictions into active vs resolved groups.
 * Pure + non-mutating. An empty input yields `{ active: [], resolved: [] }`.
 */
export function groupPredictions(predictions: UserPrediction[]): PredictionsGroups {
  const active: UserPrediction[] = [];
  const resolved: UserPrediction[] = [];

  for (const p of predictions) {
    if (p.status === 'settled') {
      resolved.push(p);
    } else {
      active.push(p);
    }
  }

  return { active, resolved };
}
