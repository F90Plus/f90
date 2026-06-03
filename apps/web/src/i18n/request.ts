import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

/**
 * Resolves the active locale per request and loads its message catalog from
 * `locales/<locale>.json`. Falling back to the default locale keeps unknown
 * locales from throwing.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    // Fixed zone → deterministic date formatting (no SSR/client hydration drift).
    timeZone: 'UTC',
    messages: (await import(`../../locales/${locale}.json`)).default,
  };
});
