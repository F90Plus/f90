'use client';

import { useEffect, useMemo, useState } from 'react';
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { checkUsername, updateProfile } from './actions';
import { ONBOARDING_IDLE, parseCountryCode, type OnboardingState } from './validation';
import type { OnboardingCountry } from './countries';

type Check =
  | { state: 'idle' | 'checking' | 'available' | 'taken' }
  | { state: 'invalid'; error: 'usernameFormat' | 'usernameReserved' };

type Action = (state: OnboardingState, formData: FormData) => Promise<OnboardingState>;

export function OnboardingForm({
  locale,
  countries,
}: {
  locale: string;
  countries: OnboardingCountry[];
}) {
  const t = useTranslations('onboarding');
  const action = updateProfile.bind(null, locale) as unknown as Action;
  const [state, formAction, isPending] = useActionState<OnboardingState, FormData>(
    action,
    ONBOARDING_IDLE,
  );

  const [username, setUsername] = useState('');
  const [check, setCheck] = useState<Check>({ state: 'idle' });
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState('');

  const validCodes = useMemo(() => new Set(countries.map((c) => c.code)), [countries]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? countries.filter((c) => c.name.toLowerCase().includes(q)) : countries;
  }, [countries, query]);

  // Debounced live availability check, guarded against out-of-order resolutions.
  useEffect(() => {
    const v = username.trim().toLowerCase();
    if (v.length < 3) {
      setCheck({ state: 'idle' });
      return;
    }
    setCheck({ state: 'checking' });
    let active = true;
    const id = setTimeout(() => {
      checkUsername(v).then((res) => {
        if (!active) return;
        if (res.error) setCheck({ state: 'invalid', error: res.error });
        else setCheck({ state: res.available ? 'available' : 'taken' });
      });
    }, 400);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [username]);

  const countryOk = parseCountryCode(selected, validCodes).ok;
  const canSubmit = check.state === 'available' && countryOk && !isPending;

  return (
    <form action={formAction} className="space-y-7">
      {/* Username */}
      <div className="space-y-2">
        <label htmlFor="username" className="block text-sm font-medium text-mist-200">
          {t('username.label')}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-mist-500">
            @
          </span>
          <input
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={20}
            placeholder={t('username.placeholder')}
            aria-invalid={check.state === 'taken' || check.state === 'invalid'}
            className={cn(
              'w-full rounded-pill border bg-night-800/60 py-3 pl-8 pr-28 text-sm text-mist-100 placeholder:text-mist-500',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-led-400/60',
              check.state === 'available'
                ? 'border-pitch-500/50'
                : check.state === 'taken' || check.state === 'invalid'
                  ? 'border-flare-500/50'
                  : 'border-mist-500/15',
            )}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium">
            {check.state === 'checking' && <span className="text-mist-500">{t('username.checking')}</span>}
            {check.state === 'available' && <span className="text-pitch-300">✓ {t('username.available')}</span>}
            {check.state === 'taken' && <span className="text-flare-400">{t('username.taken')}</span>}
            {check.state === 'invalid' && (
              <span className="text-flare-400">{t(`errors.${check.error}`)}</span>
            )}
          </span>
        </div>
        <p className="text-xs text-mist-500">{t('username.hint')}</p>
      </div>

      {/* Country picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-mist-200">{t('country.label')}</label>
        <input type="hidden" name="country" value={selected} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('country.search')}
          aria-label={t('country.search')}
          className="w-full rounded-pill border border-mist-500/15 bg-night-800/60 px-4 py-2.5 text-sm text-mist-100 placeholder:text-mist-500 focus:outline-none focus:ring-2 focus:ring-led-400/60"
        />
        <div className="max-h-64 overflow-y-auto rounded-card border border-mist-500/10 bg-night-900/40 p-2 [scrollbar-width:thin]">
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {filtered.map((c) => {
              const isSelected = c.code === selected;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelected(c.code)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-center gap-2.5 rounded-pill border px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'border-led-400/60 bg-led-500/10 text-white'
                      : 'border-transparent text-mist-200 hover:bg-night-700/50',
                  )}
                >
                  {c.flag ? (
                    <span
                      role="img"
                      aria-hidden
                      className={cn(
                        'block h-5 w-5 shrink-0 rounded-full bg-cover bg-center ring-1',
                        c.isHost ? 'ring-gold-400/60' : 'ring-mist-200/15',
                      )}
                      style={{ backgroundImage: `url(${c.flag})` }}
                    />
                  ) : (
                    <span
                      aria-hidden
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.5rem] font-bold text-night-950 ring-1',
                        c.isHost ? 'ring-gold-400/60' : 'ring-mist-200/15',
                      )}
                      style={{ background: `linear-gradient(140deg, ${c.accent}, ${c.accent}99)` }}
                    >
                      {c.code.slice(0, 2)}
                    </span>
                  )}
                  <span className="truncate">{c.name}</span>
                  {c.isHost && (
                    <span className="ml-auto shrink-0 text-[0.6rem] uppercase tracking-wide text-gold-300">
                      {t('country.hostBadge')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-flare-400">
          {t(`errors.${state.error}`)}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
      >
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
