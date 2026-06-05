import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isProfileComplete } from '@/features/profile/validation';
import { localePathname } from './validation';

/**
 * Server-side gate for the authenticated `(app)` group. Verifies the session
 * against Supabase (never trusts cookies blindly) and enforces onboarding:
 *  - no session            → /login?next=<dest>
 *  - signed in, not onboarded → /onboarding
 * Returns the verified user id when access is granted. Onboarding itself lives
 * OUTSIDE the group (its own session check), so there is no redirect loop.
 */
export async function requireOnboardedUser(locale: string, next = '/home'): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`${localePathname(locale, '/login')}?next=${encodeURIComponent(next)}`);
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('country_code, username_changed_at')
    .eq('id', user.id)
    .maybeSingle();

  if (!isProfileComplete(profile)) {
    redirect(localePathname(locale, '/onboarding'));
  }

  return user.id;
}
