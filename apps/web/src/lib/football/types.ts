import type { ProbTriplet } from '@/lib/copilot/model';

/** A team as the UI needs it. `strength` is our internal rating (drives the model). */
export interface TeamLite {
  code: string;
  name: string;
  accent: string;
  strength: number;
}

/**
 * The normalized fixture the homepage renders. Produced by the real source
 * (openfootball) or the mock fallback — the UI never knows which.
 */
export interface HomeMatch {
  id: string;
  group: string; // 'A'
  kickoffISO: string | null; // UTC instant (sorting / countdown)
  dateISO: string | null; // 'YYYY-MM-DD' (locale-formatted for display)
  timeLabel: string | null; // local stadium kickoff, e.g. '13:00'
  ground: string | null;
  status: 'upcoming' | 'live';
  home: TeamLite;
  away: TeamLite;
  prob: ProbTriplet;
  /** true = probability is model-derived (our engine), not bookmaker odds. */
  modeled: boolean;
  /** provenance: 'openfootball' | 'mock'. */
  source: string;
}
