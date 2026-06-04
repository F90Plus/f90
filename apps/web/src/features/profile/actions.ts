'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { localePathname } from '@/features/auth/validation';
import { parseUsername, type OnboardingState } from './validation';

/**
 * Profile Server Actions. Writes go through the `profiles` RLS self-update policy
 * (auth.uid() = id), so a user can only ever edit their own row. The DB is the
 * authority for uniqueness (citext unique) and the country FK — we map those
 * violations to localized error keys.
 */

export type UsernameCheck = {
  available: boolean;
  error?: 'usernameFormat' | 'usernameReserved';
};

/**
 * Live availability probe for the onboarding field. Format-checks first (cheap),
 * then reads `profiles` (world-readable RLS) case-insensitively. Debounced by the
 * client. Not authoritative — `updateProfile` re-checks atomically at write time.
 */
export async function checkUsername(value: string): Promise<UsernameCheck> {
  const parsed = parseUsername(value);
  if (!parsed.ok) return { available: false, error: parsed.error };

  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', parsed.username)
    .maybeSingle();

  return { available: !data };
}

/**
 * Commit the onboarding choices: a unique username + a favourite country. Sets
 * the *_changed_at stamps so the 30-day cooldown (D-031/T8) starts now. On the
 * unique-violation race two users hit at once, the loser gets `usernameTaken`.
 * Bound with (locale); the form supplies (prevState, formData).
 */
export async function updateProfile(
  locale: string,
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(localePathname(locale, '/login'));

  const parsedName = parseUsername(formData.get('username'));
  if (!parsedName.ok) return { status: 'error', error: parsedName.error };

  const country = formData.get('country');
  if (typeof country !== 'string' || country.length === 0) {
    return { status: 'error', error: 'countryInvalid' };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('profiles')
    .update({
      username: parsedName.username,
      country_code: country,
      username_changed_at: now,
      country_changed_at: now,
    })
    .eq('id', user.id);

  if (error) {
    if (error.code === '23505') return { status: 'error', error: 'usernameTaken' }; // unique_violation
    if (error.code === '23503') return { status: 'error', error: 'countryInvalid' }; // fk_violation
    return { status: 'error', error: 'failed' };
  }

  redirect(localePathname(locale, '/'));
}
