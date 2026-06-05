'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { parseOutcome, type Outcome } from './validation';

/**
 * Stable error keys for the predict flow. The UI maps these to localized copy;
 * the action never surfaces raw Postgres/Supabase messages to the client.
 *
 * Key → meaning:
 *  notAuthenticated  No active session (or the SECURITY DEFINER caught uid=null).
 *  invalidOutcome    The outcome string is not 'home' | 'draw' | 'away'.
 *  notFound          The fixture_id does not exist in the fixtures table.
 *  locked            Kickoff has passed, the prediction is already settled, or
 *                    the fixture has no model probability for this outcome.
 *  unknown           Any other Postgres error — logged server-side in prod.
 */
export type PredictionErrorKey =
  | 'notAuthenticated'
  | 'invalidOutcome'
  | 'notFound'
  | 'locked'
  | 'unknown';

type PredictionResult =
  | { ok: true; pick: Outcome }
  | { ok: false; error: PredictionErrorKey };

/**
 * Map a Postgres SQLSTATE / error code to our stable error key.
 *
 * Matches the `USING errcode` clauses in `make_prediction()` (migration 0004):
 *  42501  → not authenticated      (raised when auth.uid() is null)
 *  22023  → invalid_parameter_value (raised when p_outcome not in enum)
 *  P0002  → no_data_found          (raised when fixture not found)
 *  P0001  → raise_exception        (kickoff lock, settled, or no probability)
 */
function mapErrorCode(code: string | undefined): PredictionErrorKey {
  switch (code) {
    case '42501':
      return 'notAuthenticated';
    case '22023':
      return 'invalidOutcome';
    case 'P0002':
      return 'notFound';
    case 'P0001':
      return 'locked';
    default:
      return 'unknown';
  }
}

/**
 * Server Action: place or update a match-result prediction.
 *
 * The sole write path is the `make_prediction(p_fixture_id, p_outcome)` SECURITY
 * DEFINER RPC — this action is intentionally THIN:
 *  1. Authenticate (auth.getUser — verifies the session against Supabase).
 *  2. Validate the outcome string (parseOutcome throws on invalid values).
 *  3. Call the RPC (which enforces the kickoff lock + computes points_possible).
 *  4. Map any Postgres error to a stable key (no raw messages to the client).
 *  5. On success, revalidate the pages that display predictions.
 *
 * Always returns a typed result — never throws. The caller (client island) shows
 * a localized message keyed by `error`.
 *
 * NOTE: Onboarding is NOT required to predict (D-050 design: predictions are open
 * to any authenticated user). If the product later gates on onboarding, replace
 * the auth.getUser() check with requireOnboardedUser() and return
 * { ok:false, error:'notAuthenticated' } — but that is a scope decision.
 */
export async function makePrediction(
  fixtureId: string,
  outcome: string,
): Promise<PredictionResult> {
  try {
    // 1. Authenticate
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: 'notAuthenticated' };
    }

    // 2. Validate the outcome string
    let parsed: Outcome;
    try {
      parsed = parseOutcome(outcome);
    } catch {
      return { ok: false, error: 'invalidOutcome' };
    }

    // 3. Call the SECURITY DEFINER RPC (the authoritative write path)
    const { error } = await supabase.rpc('make_prediction', {
      p_fixture_id: fixtureId,
      p_outcome: parsed,
    });

    // 4. Map Postgres errors to stable keys
    if (error) {
      return { ok: false, error: mapErrorCode(error.code) };
    }

    // 5. Revalidate pages that render predictions data
    revalidatePath('/home');
    revalidatePath('/predictions');

    return { ok: true, pick: parsed };
  } catch {
    // Any unexpected error (transport/env/etc.) — never throw out of a Server Action
    return { ok: false, error: 'unknown' };
  }
}
