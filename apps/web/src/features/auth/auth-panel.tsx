import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/layout/logo';
import { MagicLinkForm } from './magic-link-form';
import { GoogleButton } from './google-button';
import { signInWithGoogle, signInWithMagicLink } from './actions';

export type AuthErrorKey = 'auth' | 'oauth';

/** Whitelist the `?error=` query param to a known key (else undefined) so the UI
 * never tries to render an attacker-supplied translation key. */
export function parseAuthError(value: unknown): AuthErrorKey | undefined {
  return value === 'auth' || value === 'oauth' ? value : undefined;
}

/**
 * The shared auth surface for /login and /signup. A premium broadcast panel:
 * Google OAuth, a divider, the passwordless email form, the mode switch and the
 * free-to-play legal note. Server-rendered; binds the locale + `next` into the
 * actions so both flows return the user to the right place, in the right language.
 */
export async function AuthPanel({
  locale,
  next,
  mode,
  errorKey,
}: {
  locale: string;
  next: string;
  mode: 'login' | 'signup';
  errorKey?: AuthErrorKey;
}) {
  const t = await getTranslations('auth');
  const isLogin = mode === 'login';
  const magicAction = signInWithMagicLink.bind(null, locale, next);
  const googleAction = signInWithGoogle.bind(null, locale, next);

  return (
    <Card className="w-full max-w-md p-7 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <Logo height={40} priority />
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight text-white">
          {isLogin ? t('login.title') : t('signup.title')}
        </h1>
        <p className="mt-2 text-sm text-mist-300">
          {isLogin ? t('login.subtitle') : t('signup.subtitle')}
        </p>
      </div>

      {errorKey && (
        <p
          role="alert"
          className="mt-5 rounded-pill border border-flare-500/40 bg-flare-500/10 px-4 py-2.5 text-center text-sm text-flare-300"
        >
          {t(`errors.${errorKey}`)}
        </p>
      )}

      <div className="mt-6 space-y-4">
        <GoogleButton action={googleAction} />

        <div className="flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-mist-500">
          <span className="h-px flex-1 bg-mist-500/15" />
          {t('divider')}
          <span className="h-px flex-1 bg-mist-500/15" />
        </div>

        <MagicLinkForm action={magicAction} />
      </div>

      <p className="mt-6 text-center text-sm text-mist-400">
        {isLogin ? t('switch.toSignupLead') : t('switch.toLoginLead')}{' '}
        <Link
          href={isLogin ? '/signup' : '/login'}
          className="font-semibold text-led-300 transition-colors hover:text-led-200"
        >
          {isLogin ? t('switch.toSignup') : t('switch.toLogin')}
        </Link>
      </p>

      <p className="mt-5 text-center text-xs leading-relaxed text-mist-500">{t('disclaimer')}</p>
    </Card>
  );
}
