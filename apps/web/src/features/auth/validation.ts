import { z } from 'zod';
import { routing } from '@/i18n/routing';

/**
 * Pure, server-and-test-safe auth helpers. No I/O here — Supabase calls live in
 * `actions.ts`. Keeping validation + redirect resolution pure makes the security
 * boundary (open-redirect, email shape) unit-testable without a browser or a DB.
 */

/** Trim + lowercase, THEN validate the shape — so trailing spaces never fail it. */
const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

export type EmailParse =
  | { ok: true; email: string }
  | { ok: false; error: 'invalidEmail' };

/**
 * Magic-link form state for `useActionState`. Error keys map 1:1 to the `auth`
 * i18n namespace (`errors.<key>`), so the UI never renders a raw zod/Supabase
 * message. Lives here (a plain module) rather than in the `'use server'` file,
 * where only async actions may be exported.
 */
export type MagicLinkState =
  | { status: 'idle' }
  | { status: 'sent'; email: string }
  | { status: 'error'; error: 'invalidEmail' | 'sendFailed' };

export const MAGIC_LINK_IDLE: MagicLinkState = { status: 'idle' };

/**
 * Validate a (possibly missing) FormData email field. Returns a normalised email
 * or a stable error KEY that the UI maps to a localized message — never a raw
 * zod message, so copy stays in `locales/`.
 */
export function parseEmail(value: unknown): EmailParse {
  const result = emailSchema.safeParse(value);
  return result.success
    ? { ok: true, email: result.data }
    : { ok: false, error: 'invalidEmail' };
}

/** True if the string carries any control character (NUL..US or DEL) — used to
 * reject newline/CR/tab smuggling in a redirect target. Checked by char code so
 * the source stays free of literal control bytes. */
function hasControlChar(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/**
 * Reduce an untrusted `next` to a safe INTERNAL path, defeating open redirects.
 * Only a single-leading-slash path survives; everything else collapses to "/".
 * Blocks: external/absolute URLs, protocol-relative `//`, backslash tricks
 * (browsers normalise `\` → `/`) and control characters.
 */
export function resolveSafeNext(next: unknown): string {
  if (typeof next !== 'string' || next.length === 0) return '/';
  if (!next.startsWith('/')) return '/'; // not a path → drop (covers scheme: and bare hosts)
  if (next.startsWith('//')) return '/'; // protocol-relative → external
  if (next.includes('\\')) return '/'; // backslash → normalises to // on some browsers
  if (hasControlChar(next)) return '/';
  return next;
}

/**
 * Apply next-intl's `as-needed` locale prefix to an internal path: the default
 * locale (`es`) stays unprefixed, others get `/<locale>`. Mirrors `routing` so
 * Route Handlers (which see raw URLs, not next-intl navigation) preserve locale.
 */
export function localePathname(locale: string, pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const isKnown = (routing.locales as readonly string[]).includes(locale);
  if (!isKnown || locale === routing.defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

/** Safe + locale-aware post-auth redirect path (sanitise, then localise). */
export function postAuthRedirectPath(locale: string, next: unknown): string {
  return localePathname(locale, resolveSafeNext(next));
}
