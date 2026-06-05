import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

// Next 16 renamed the "middleware" convention to "proxy" (same API).
//
// ONE composed middleware: next-intl negotiates the locale and produces the
// response, then Supabase refreshes the auth session and writes its cookies onto
// that SAME response — so locale routing AND session refresh both work, in the
// right order, on a single response (D-028).
const handleI18nRouting = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  return updateSession(request, response);
}

export const config = {
  // Run on every path except API routes, Next internals, and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
