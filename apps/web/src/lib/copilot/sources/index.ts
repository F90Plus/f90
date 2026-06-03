import type { FixtureSignalsInput } from '../model';
import type { CopilotSource } from './types';
import { apiFootballSource } from './api-football';
import { footballDataSource } from './football-data';
import { mockSource } from './mock';

/**
 * Source priority: live providers first (when enabled), with the mock source as
 * the always-on fallback. In production a cache layer wraps this so user requests
 * read from our store, never from third parties (see AI_COPILOT_ARCHITECTURE_V1).
 */
const SOURCES: CopilotSource[] = [apiFootballSource, footballDataSource, mockSource];

export async function getFixtureSignals(fixtureId: string): Promise<FixtureSignalsInput | null> {
  for (const source of SOURCES) {
    if (!source.isEnabled()) continue;
    const data = await source.getFixtureSignals(fixtureId);
    if (data) return data;
  }
  return null;
}

export type { CopilotSource };
