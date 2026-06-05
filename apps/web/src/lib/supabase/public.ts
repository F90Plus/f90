import { createClient } from '@supabase/supabase-js';

/**
 * Anonymous, cookie-less Supabase client for PUBLIC reads on cacheable pages
 * (e.g. the homepage rankings teaser, T9). Returns null when the Supabase env is
 * absent, so public pages still render on a preview deploy — a no-backend read
 * degrades to an empty result, never a crash (mirrors `getCurrentUser`'s guard).
 *
 * Cookie-less by design: it never touches request cookies, so it does NOT force
 * dynamic rendering. The fetch is wrapped with an ISR `revalidate` window so the
 * homepage stays cache-first (D-007) and scales without per-request DB load.
 * As the `anon` role it only ever sees world-readable rows (RLS): countries,
 * profiles, global_rankings.
 */
export function createPublicClient(revalidate = 300) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, next: { revalidate } }),
    },
  });
}
