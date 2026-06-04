'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  localePathname,
  parseEmail,
  resolveSafeNext,
  type MagicLinkState,
} from './validation';

/**
 * Auth Server Actions — the ONLY place that talks to Supabase auth. The browser
 * never sees the secret key; sessions are written as httpOnly cookies by the SSR
 * client (lib/supabase/server). Generic by design (D-034): nothing here is
 * coupled to predictions/markets/fantasy — it just establishes identity.
 *
 * Both magic-link and Google land on /[locale]/callback, which completes the
 * session and forwards to a locale-correct, open-redirect-safe `next`.
 */

const CALLBACK_PATH = '/callback';

/** Absolute origin of THIS request — correct in dev, preview and prod (the host
 * header always reflects where the user actually is). Falls back to the
 * configured public URL, then localhost. */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  if (host) {
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
    return `${proto}://${host}`;
  }
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  return configured ? configured.replace(/\/+$/, '') : 'http://localhost:3000';
}

/** The absolute callback URL Supabase redirects back to, carrying a safe `next`. */
async function callbackUrl(locale: string, next: string): Promise<string> {
  const origin = await siteOrigin();
  const path = localePathname(locale, CALLBACK_PATH);
  return `${origin}${path}?next=${encodeURIComponent(resolveSafeNext(next))}`;
}

/**
 * Send a passwordless magic link. `shouldCreateUser: true` so a brand-new email
 * gets an account (the handle_new_user trigger provisions profile + wallet +
 * 1,000-coin welcome bonus) — login and signup share this frictionless path.
 * Bound with (locale, next); the form supplies (prevState, formData).
 */
export async function signInWithMagicLink(
  locale: string,
  next: string,
  _prevState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const parsed = parseEmail(formData.get('email'));
  if (!parsed.ok) return { status: 'error', error: parsed.error };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: await callbackUrl(locale, next),
    },
  });

  if (error) return { status: 'error', error: 'sendFailed' };
  return { status: 'sent', email: parsed.email };
}

/**
 * Begin Google OAuth. Supabase returns the provider authorize URL; we redirect
 * the browser to it (server-side). On failure, back to login with an error flag.
 * Bound with (locale, next); the form supplies formData (unused).
 */
export async function signInWithGoogle(
  locale: string,
  next: string,
  _formData: FormData,
): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: await callbackUrl(locale, next) },
  });

  if (error || !data?.url) {
    redirect(`${localePathname(locale, '/login')}?error=oauth`);
  }
  redirect(data.url);
}

/** Sign out and return home in the active locale. Bound with (locale). */
export async function signOut(locale: string): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(localePathname(locale, '/'));
}
