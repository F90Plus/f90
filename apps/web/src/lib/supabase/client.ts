import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for Client Components / interactive islands (browser).
 * Uses the PUBLISHABLE key — safe in the browser; RLS enforces access.
 *
 * Generic by design (D-034): predictions, Polymarket-style markets, player
 * trading and fantasy will all talk to Supabase through these same clients —
 * nothing here is coupled to a specific subsystem.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
