import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Refresh the Supabase auth session on each request and write any updated
 * session cookies onto BOTH the request and the provided `response`.
 *
 * Designed to be COMPOSED with the next-intl middleware (see proxy.ts): next-intl
 * owns locale routing and produces the response; this refreshes the session and
 * writes the refreshed cookies onto that SAME response (for the browser / the next
 * request) AND back onto the request (so the current request's Server Components
 * read the fresh session, not the rotated/expired token — D-047), per the canonical
 * @supabase/ssr contract. Both concerns survive on one response.
 *
 * Do not insert code between `createServerClient` and `getUser()` — the auth call
 * is what refreshes an expiring token.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // Without Supabase env (e.g. a preview deploy of the public site), skip the
  // auth session refresh so the public pages still render. Inert when env is set.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Canonical @supabase/ssr contract — write refreshed cookies to BOTH sinks:
          //  • the request, so the CURRENT request's Server Components read the fresh
          //    session instead of the just-rotated/expired token (the ~1h "unexpected
          //    logout", D-047);
          //  • the response, so the browser keeps the new session for the next request.
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getUser();
  return response;
}
