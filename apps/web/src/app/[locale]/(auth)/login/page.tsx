import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthPanel, parseAuthError } from '@/features/auth/auth-panel';
import { resolveSafeNext } from '@/features/auth/validation';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('login.metaTitle'), robots: { index: false } };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  // After login, land on the authenticated home (the (app) gate sends not-yet-onboarded
  // users to /onboarding). A gate-supplied ?next= (e.g. /settings) is preserved.
  const next = resolveSafeNext(typeof sp.next === 'string' ? sp.next : '/home');
  return <AuthPanel locale={locale} next={next} mode="login" errorKey={parseAuthError(sp.error)} />;
}
