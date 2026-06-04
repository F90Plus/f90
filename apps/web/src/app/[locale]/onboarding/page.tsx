import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { localePathname } from '@/features/auth/validation';
import { getCountries } from '@/features/profile/countries';
import { OnboardingForm } from '@/features/profile/onboarding-form';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'onboarding' });
  return { title: t('metaTitle'), robots: { index: false } };
}

export default async function OnboardingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Onboarding requires a session. `next` is locale-neutral; the callback localises it.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`${localePathname(locale, '/login')}?next=${encodeURIComponent('/onboarding')}`);
  }

  const [t, countries] = await Promise.all([
    getTranslations('onboarding'),
    getCountries(locale),
  ]);

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16 sm:py-20">
      <Card className="w-full max-w-lg p-7 sm:p-8">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-white">{t('title')}</h1>
          <p className="mt-2 text-sm text-mist-300">{t('subtitle')}</p>
        </div>
        <div className="mt-7">
          <OnboardingForm locale={locale} countries={countries} />
        </div>
      </Card>
    </div>
  );
}
