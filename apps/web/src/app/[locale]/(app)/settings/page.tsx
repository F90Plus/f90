import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { canChangeAfterCooldown } from '@/features/profile/validation';
import { getCountries } from '@/features/profile/countries';
import { SettingsForm } from '@/features/profile/settings-form';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'settings' });
  return { title: t('metaTitle'), robots: { index: false } };
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // guaranteed by the (app) layout

  const [t, profileRes, countries] = await Promise.all([
    getTranslations('settings'),
    supabase
      .from('profiles')
      .select('display_name, bio, username, country_code, username_changed_at, country_changed_at')
      .eq('id', user.id)
      .single(),
    getCountries(locale),
  ]);

  const profile = profileRes.data;
  if (!profile) return null;

  const now = new Date();
  const u = canChangeAfterCooldown(profile.username_changed_at, now);
  const c = canChangeAfterCooldown(profile.country_changed_at, now);

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white">{t('title')}</h1>
        <p className="mt-1 text-sm text-mist-400">{t('subtitle')}</p>
        <Card className="mt-6 p-7 sm:p-8">
          <SettingsForm
            locale={locale}
            initial={{
              display_name: profile.display_name,
              bio: profile.bio,
              username: profile.username,
              country_code: profile.country_code,
            }}
            countries={countries}
            usernameCooldown={{ allowed: u.allowed, nextAtISO: u.nextAt?.toISOString() ?? null }}
            countryCooldown={{ allowed: c.allowed, nextAtISO: c.nextAt?.toISOString() ?? null }}
          />
        </Card>
      </div>
    </Container>
  );
}
