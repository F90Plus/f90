/**
 * SERVER-ONLY — never import this module into Client Components or
 * client-side code. It uses the Supabase service-role key which bypasses
 * ALL Row Level Security policies. Use only in trusted server routes and
 * background jobs that need to write or read data without a user session.
 *
 * Safe entry points: Route Handlers (app/api/**), Server Actions, seed scripts.
 * Unsafe: client components, browser-executed code, shared utilities.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase admin client authenticated with the service-role key.
 * Throws a descriptive error if the required environment variables are absent
 * so misconfigurations are caught at call time, not silently at query time.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error(
      '[admin] NEXT_PUBLIC_SUPABASE_URL is not set. Add it to your environment variables.',
    );
  }
  if (!serviceKey) {
    throw new Error(
      '[admin] SUPABASE_SECRET_KEY is not set. Add the service-role key to your environment variables. ' +
        'Never expose this key client-side or commit it to version control.',
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
