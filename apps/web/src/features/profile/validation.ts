/**
 * Pure onboarding validation — mirrors the DB contract so the UI can reject bad
 * input before any round-trip. The `profiles.username` column is citext-unique
 * with check `^[a-z0-9_]{3,20}$`; `country_code` is an FK into `countries`.
 * Kept I/O-free so the rules are unit-testable without Supabase. Uniqueness and
 * the FK are still enforced server-side (the DB is the authority).
 */

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/** Handles we keep for the system / avoid impersonation. Compared lowercase. */
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  'admin', 'administrator', 'root', 'system', 'mod', 'moderator', 'official',
  'f90', 'f90plus', 'f90official', 'support', 'help', 'about', 'contact',
  'login', 'signin', 'signup', 'logout', 'onboarding', 'settings', 'account',
  'profile', 'me', 'you', 'user', 'users', 'api', 'null', 'undefined',
]);

export type UsernameParse =
  | { ok: true; username: string }
  | { ok: false; error: 'usernameFormat' | 'usernameReserved' };

/**
 * Normalise (trim + lowercase) then validate a username against the DB shape and
 * the reserved list. Returns a stable error KEY mapped to localized copy by the UI.
 */
export function parseUsername(value: unknown): UsernameParse {
  if (typeof value !== 'string') return { ok: false, error: 'usernameFormat' };
  const username = value.trim().toLowerCase();
  if (!USERNAME_RE.test(username)) return { ok: false, error: 'usernameFormat' };
  if (RESERVED_USERNAMES.has(username)) return { ok: false, error: 'usernameReserved' };
  return { ok: true, username };
}

export type CountryParse =
  | { ok: true; code: string }
  | { ok: false; error: 'countryInvalid' };

/**
 * Validate a country code against the set the caller actually offered (loaded
 * from `countries`). The DB FK is the final authority; this is the early gate.
 */
export function parseCountryCode(value: unknown, valid: ReadonlySet<string>): CountryParse {
  if (typeof value !== 'string' || value.length === 0 || !valid.has(value)) {
    return { ok: false, error: 'countryInvalid' };
  }
  return { ok: true, code: value };
}

/**
 * Has the user finished onboarding? True once they actively chose a handle
 * (`username_changed_at` set by `updateProfile`) AND a country. The `handle_new_user`
 * trigger leaves both unset, so this cleanly distinguishes a fresh account from an
 * onboarded one — without guessing at the `fan_*` default username.
 */
export function isProfileComplete(
  profile: { country_code: string | null; username_changed_at: string | null } | null,
): boolean {
  return Boolean(profile && profile.country_code && profile.username_changed_at);
}

/** Onboarding form state for `useActionState`. Error keys map to `onboarding.errors.*`. */
export type OnboardingState =
  | { status: 'idle' }
  | {
      status: 'error';
      error: 'usernameFormat' | 'usernameReserved' | 'usernameTaken' | 'countryInvalid' | 'failed';
    };

export const ONBOARDING_IDLE: OnboardingState = { status: 'idle' };
