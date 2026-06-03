import type { CopilotSource } from './types';
import { MOCK_FIXTURE_SIGNALS } from './mock-data';

/**
 * The always-on fallback source. Serves cached mock snapshots so the Copilot is
 * fully functional at $0, offline, and deterministic. In production this sits
 * behind the live sources as the graceful fallback.
 */
export const mockSource: CopilotSource = {
  id: 'mock',
  isEnabled: () => true,
  async getFixtureSignals(fixtureId) {
    return MOCK_FIXTURE_SIGNALS[fixtureId] ?? null;
  },
};
