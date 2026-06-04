'use client';

import { useActionState, useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { updateSettings } from './actions';
import { SETTINGS_IDLE, type SettingsState } from './validation';
import type { OnboardingCountry } from './countries';

type Action = (state: SettingsState, formData: FormData) => Promise<SettingsState>;
type Cooldown = { allowed: boolean; nextAtISO: string | null };

const inputCls =
  'w-full rounded-pill border border-mist-500/15 bg-night-800/60 px-4 py-2.5 text-sm text-mist-100 placeholder:text-mist-500 transition-colors focus:outline-none focus:ring-2 focus:ring-led-400/60 disabled:cursor-not-allowed disabled:opacity-50';

export function SettingsForm({
  locale,
  initial,
  countries,
  usernameCooldown,
  countryCooldown,
}: {
  locale: string;
  initial: {
    display_name: string | null;
    bio: string | null;
    username: string;
    country_code: string | null;
  };
  countries: OnboardingCountry[];
  usernameCooldown: Cooldown;
  countryCooldown: Cooldown;
}) {
  const t = useTranslations('settings');
  const format = useFormatter();
  const action = updateSettings.bind(null, locale) as unknown as Action;
  const [state, formAction, isPending] = useActionState<SettingsState, FormData>(
    action,
    SETTINGS_IDLE,
  );
  const [bio, setBio] = useState(initial.bio ?? '');

  const cooldownHint = (cd: Cooldown) =>
    cd.allowed || !cd.nextAtISO
      ? null
      : t('cooldownHint', {
          date: format.dateTime(new Date(cd.nextAtISO), { day: 'numeric', month: 'long' }),
        });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="display_name" className="block text-sm font-medium text-mist-200">
          {t('displayNameLabel')}
        </label>
        <input
          id="display_name"
          name="display_name"
          defaultValue={initial.display_name ?? ''}
          maxLength={50}
          placeholder={t('displayNamePlaceholder')}
          className={inputCls}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="bio" className="block text-sm font-medium text-mist-200">
          {t('bioLabel')}
        </label>
        <textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={280}
          rows={3}
          placeholder={t('bioPlaceholder')}
          className={cn(inputCls, 'rounded-card resize-none')}
        />
        <p className="nums text-right text-xs text-mist-500">{bio.length}/280</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="username" className="block text-sm font-medium text-mist-200">
          {t('usernameLabel')}
        </label>
        <input
          id="username"
          name="username"
          defaultValue={initial.username}
          disabled={!usernameCooldown.allowed}
          autoCapitalize="none"
          spellCheck={false}
          maxLength={20}
          className={inputCls}
        />
        {cooldownHint(usernameCooldown) && (
          <p className="text-xs text-mist-500">{cooldownHint(usernameCooldown)}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="country" className="block text-sm font-medium text-mist-200">
          {t('countryLabel')}
        </label>
        <select
          id="country"
          name="country"
          defaultValue={initial.country_code ?? ''}
          disabled={!countryCooldown.allowed}
          className={inputCls}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code} className="bg-night-900">
              {c.name}
            </option>
          ))}
        </select>
        {cooldownHint(countryCooldown) && (
          <p className="text-xs text-mist-500">{cooldownHint(countryCooldown)}</p>
        )}
      </div>

      {state.status === 'error' && (
        <p role="alert" className="text-sm text-flare-400">
          {t(`errors.${state.error}`)}
        </p>
      )}
      {state.status === 'saved' && (
        <p role="status" className="text-sm text-pitch-300">
          {t('saved')}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
      >
        {isPending ? t('saving') : t('save')}
      </button>
    </form>
  );
}
