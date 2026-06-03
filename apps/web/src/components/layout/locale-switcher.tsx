'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/** Compact ES/EN segmented toggle. Preserves the current path when switching. */
export function LocaleSwitcher() {
  const t = useTranslations('localeSwitcher');
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === activeLocale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div
      role="group"
      aria-label={t('aria')}
      className={cn(
        'flex items-center rounded-pill border border-mist-500/15 bg-night-800/60 p-0.5 transition-opacity',
        isPending && 'opacity-60',
      )}
    >
      {routing.locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          aria-pressed={locale === activeLocale}
          className={cn(
            'rounded-pill px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors',
            locale === activeLocale
              ? 'bg-led-500 text-white'
              : 'text-mist-400 hover:text-white',
          )}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
