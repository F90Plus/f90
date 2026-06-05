'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { localePathname } from '@/features/auth/validation';
import {
  canChangeAfterCooldown,
  parseUsername,
  type OnboardingState,
  type SettingsState,
} from './validation';

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

  redirect(localePathname(locale, '/home')); // onboarded → the authed app home (T6)
}

/**
 * Settings save (T8). `display_name` and `bio` change freely; `username` and
 * `country` are gated by the 30-day cooldown (D-031), enforced server-side from
 * the `*_changed_at` stamps and only when the value actually changes. Writes via
 * the RLS self-update policy. Bound with (locale); the form supplies (prev, formData).
 */
export async function updateSettings(
  locale: string,
  _prevState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(localePathname(locale, '/login'));

  const { data: current } = await supabase
    .from('profiles')
    .select('username, country_code, username_changed_at, country_changed_at')
    .eq('id', user.id)
    .single();
  if (!current) return { status: 'error', error: 'failed' };

  const now = new Date();
  const update: Record<string, unknown> = {};

  // Free fields.
  const displayName = String(formData.get('display_name') ?? '').trim();
  update.display_name = displayName.slice(0, 50) || null;

  const bio = String(formData.get('bio') ?? '').trim();
  if (bio.length > 280) return { status: 'error', error: 'bioTooLong' };
  update.bio = bio || null;

  // Username — cooldown-gated, only when it actually changes.
  const newUsername = String(formData.get('username') ?? '').trim().toLowerCase();
  if (newUsername && newUsername !== current.username) {
    if (!canChangeAfterCooldown(current.username_changed_at, now).allowed) {
      return { status: 'error', error: 'usernameCooldown' };
    }
    const parsed = parseUsername(newUsername);
    if (!parsed.ok) return { status: 'error', error: parsed.error };
    update.username = parsed.username;
    update.username_changed_at = now.toISOString();
  }

  // Country — cooldown-gated, only when it actually changes.
  const newCountry = String(formData.get('country') ?? '');
  if (newCountry && newCountry !== current.country_code) {
    if (!canChangeAfterCooldown(current.country_changed_at, now).allowed) {
      return { status: 'error', error: 'countryCooldown' };
    }
    update.country_code = newCountry;
    update.country_changed_at = now.toISOString();
  }

  const { error } = await supabase.from('profiles').update(update).eq('id', user.id);
  if (error) {
    if (error.code === '23505') return { status: 'error', error: 'usernameTaken' };
    if (error.code === '23503') return { status: 'error', error: 'countryInvalid' };
    return { status: 'error', error: 'failed' };
  }
  return { status: 'saved' };
}
