import type { CopilotSource } from './types';

/**
 * API-Football adapter — ARCHITECTURE PREPARED, not yet implemented.
 *
 * The richest free source: 100 req/day (free, no card), ALL endpoints. For the
 * Copilot we'll consume:
 *   • GET /predictions             → external model triplet (check coverage flag)
 *   • GET /odds                    → bookmaker odds → market signal (de-vig)
 *   • GET /fixtures/headtohead     → H2H signal
 *   • GET /fixtures/statistics     → quality/xG-proxy inputs
 *   • GET /standings               → context
 * WC2026 lives at league=1&season=2026. Because the free tier is 100 req/day,
 * this MUST run behind cache-first ingestion (scheduled fetch → our store), never
 * per user request.
 *
 * Enable later: set `COPILOT_SOURCE=live` + `API_FOOTBALL_KEY`, then implement
 * `getFixtureSignals` mapping the endpoints above into `FixtureSignalsInput`.
 */
export const apiFootballSource: CopilotSource = {
  id: 'api-football',
  // Intentionally disabled — interface reserved so the engine is ready for it.
  isEnabled: () => false,
  async getFixtureSignals() {
    return null;
  },
};
