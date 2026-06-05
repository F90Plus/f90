import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { localePathname, postAuthRedirectPath } from '@/features/auth/validation';

/**
 * Auth callback — completes the session for BOTH flows, then forwards to a
 * locale-correct, open-redirect-safe destination:
 *   • OAuth (Google) and PKCE magic links arrive with `?code=`  → exchangeCodeForSession
 *   • token-hash email templates arrive with `?token_hash&type` → verifyOtp
 * Handling both means the magic-link flow works whether or not the Supabase
 * email template is customised — no template edit required for it to ship.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next');

  const supabase = await createClient();

  let authError = true;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = Boolean(error);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    authError = Boolean(error);
  }

  const destination = authError
    ? `${localePathname(locale, '/login')}?error=auth`
    : postAuthRedirectPath(locale, next);

  // Resolve against the real request origin so it works on localhost, preview and prod.
  return NextResponse.redirect(new URL(destination, request.url));
}
