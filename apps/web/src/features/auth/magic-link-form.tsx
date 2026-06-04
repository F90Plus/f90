'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { MAGIC_LINK_IDLE, type MagicLinkState } from './validation';

type MagicLinkAction = (state: MagicLinkState, formData: FormData) => Promise<MagicLinkState>;

function SubmitButton() {
  const t = useTranslations('auth');
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
    >
      {pending ? t('magic.sending') : t('magic.submit')}
    </button>
  );
}

/**
 * Passwordless email form. The bound server action (signInWithMagicLink) is
 * passed in by the page; this owns only the optimistic UI — pending, the
 * "check your inbox" success state, and localized validation errors.
 */
export function MagicLinkForm({ action }: { action: MagicLinkAction }) {
  const t = useTranslations('auth');
  const [state, formAction] = useActionState<MagicLinkState, FormData>(action, MAGIC_LINK_IDLE);

  if (state.status === 'sent') {
    return (
      <div
        role="status"
        className="rounded-card border border-pitch-500/25 bg-pitch-500/5 p-5 text-center"
      >
        <p className="font-display text-base font-semibold text-pitch-300">
          {t('magic.sentTitle')}
        </p>
        <p className="mt-1.5 text-sm text-mist-300">
          {t('magic.sentBody', { email: state.email })}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium text-mist-200">
          {t('emailLabel')}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('emailPlaceholder')}
          aria-invalid={state.status === 'error'}
          className={cn(
            'w-full rounded-pill border bg-night-800/60 px-4 py-3 text-sm text-mist-100 placeholder:text-mist-500',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-led-400/60',
            state.status === 'error' ? 'border-flare-500/60' : 'border-mist-500/15',
          )}
        />
        {state.status === 'error' && (
          <p role="alert" className="text-sm text-flare-400">
            {t(`errors.${state.error}`)}
          </p>
        )}
      </div>
      <SubmitButton />
    </form>
  );
}
