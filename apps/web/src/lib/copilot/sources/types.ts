import type { FixtureSignalsInput } from '../model';

/**
 * A data source adapter. Every provider (mock, football-data.org, API-Football, …)
 * implements this, so the engine never knows or cares where data came from.
 * Swapping or adding a provider is a new file — nothing above this layer changes.
 */
export interface CopilotSource {
  readonly id: string;
  /** Whether this source is active (driven by env/config). */
  isEnabled(): boolean;
  /** Normalized signals for a fixture, or null if this source can't serve it. */
  getFixtureSignals(fixtureId: string): Promise<FixtureSignalsInput | null>;
}
