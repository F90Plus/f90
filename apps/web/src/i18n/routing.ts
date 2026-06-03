import { defineRouting } from 'next-intl/routing';

/**
 * Single source of truth for which locales F90+ ships.
 * Add a language here + a matching file in `locales/` and the whole app
 * (routing, middleware, switcher) picks it up. No other change required.
 */
export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  // Default locale lives at `/`, other locales are prefixed (`/en`).
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];

export const localeLabels: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};
