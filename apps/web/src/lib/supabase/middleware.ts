import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Refresh the Supabase auth session on each request and write any updated
 * session cookies onto the provided `response`.
 *
 * Designed to be COMPOSED with the next-intl middleware (see proxy.ts): next-intl
 * owns locale routing and produces the response; this writes the refreshed-session
 * cookies onto that SAME response, so both concerns survive on one response.
 *
 * Do not insert code between `createServerClient` and `getUser()` — the auth call
 * is what refreshes an expiring token.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
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
