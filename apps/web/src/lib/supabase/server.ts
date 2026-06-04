import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Cookie-based sessions — the correct SSR pattern for the Next 16 App Router.
 * Uses the PUBLISHABLE key plus the caller's cookies, so RLS applies per user.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component, where the cookie store is read-only.
            // Safe to ignore: the proxy middleware refreshes the session each request.
          }
        },
      },
    },
  );
}

/**
 * The current authenticated user, or null. Server-only helper that the
 * auth-aware header (T6) and protected routes will consume in later tasks.
 * Always verifies the session against Supabase — never trusts cookies blindly.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
