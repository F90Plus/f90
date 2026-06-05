import { z } from 'zod';

/**
 * Pure, server-and-test-safe prediction validation. No I/O — the Server Action
 * in actions.ts calls these. Keeping validation pure makes the outcome-parse
 * contract unit-testable without a DB or Supabase.
 */

/** The three possible outcomes for a match-result prediction. */
export type Outcome = 'home' | 'draw' | 'away';

const outcomeSchema = z.enum(['home', 'draw', 'away']);

/**
 * Parse and narrow an unknown value to `Outcome`. Throws a ZodError if the
 * value is not exactly one of the three valid outcomes (case-sensitive).
 *
 * Usage in the Server Action: wrap in try/catch and map the throw to an error
 * key — never let the raw ZodError reach the client.
 */
export function parseOutcome(value: unknown): Outcome {
  return outcomeSchema.parse(value);
}

/**
 * Safe variant of `parseOutcome` — returns `null` instead of throwing when
 * the value is not a valid Outcome. Used in read-model mappers to guard
 * against corrupt or legacy payload data stored in the DB.
 */
export function safeParseOutcome(value: unknown): Outcome | null {
  const result = outcomeSchema.safeParse(value);
  return result.success ? result.data : null;
}
