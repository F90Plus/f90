import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { getCountries } from '@/features/profile/countries';

type Props = { params: Promise<{ locale: string; username: string }> };

type PublicProfile = {
  username: string;
  display_name: string | null;
  country_code: string | null;
  total_points: number;
  created_at: string;
};

/** Public read of a profile by handle (citext → case-insensitive). RLS allows it. */
async function loadProfile(username: string): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('username, display_name, country_code, total_points, created_at')
    .eq('username', username)
    .maybeSingle();
  return (data as PublicProfile | null) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, username } = await params;
  const profile = await loadProfile(username);
  if (!profile) return { title: 'F90+' };
  const t = await getTranslations({ locale, namespace: 'profile' });
  return {
    title: t('metaTitle', { handle: profile.username }),
    description: t('metaDescription', { handle: profile.username }),
    // opengraph-image.tsx supplies the per-user OG card automatically.
  };
}

export default async function ProfilePage({ params }: Props) {
  const { locale, username } = await params;
  setRequestLocale(locale);

  const profile = await loadProfile(username);
  if (!profile) notFound();

  const [t, format, countries] = await Promise.all([
    getTranslations('profile'),
    getFormatter(),
    getCountries(locale),
  ]);

  const handle = profile.username;
  const name = profile.display_name || `@${handle}`;
  const country = countries.find((c) => c.code === profile.country_code) ?? null;
  const joined = format.dateTime(new Date(profile.created_at), { year: 'numeric', month: 'long' });

  return (
    <Container className="py-16 sm:py-24">
      <Card className="mx-auto max-w-md p-8 text-center">
        <div className="flex flex-col items-center">
          <Avatar handle={handle} size={96} />
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-white">{name}</h1>
          <p className="text-sm text-mist-400">@{handle}</p>

          {country && (
            <p className="mt-3 flex items-center gap-2 text-sm text-mist-300">
              {country.flag && (
                <span
                  aria-hidden
                  className="block h-5 w-5 rounded-full bg-cover bg-center ring-1 ring-mist-200/15"
                  style={{ backgroundImage: `url(${country.flag})` }}
                />
              )}
              {t('backing', { country: country.name })}
            </p>
          )}
          <p className="mt-1 text-xs text-mist-500">{t('joined', { date: joined })}</p>
        </div>

        <div className="mt-7 rounded-card border border-mist-500/10 bg-night-900/40 p-5">
          <p className="nums font-display text-3xl font-bold text-lime-300">
            {t('pointsValue', { points: profile.total_points })}
          </p>
          <p className="mt-1 text-xs uppercase tracking-wider text-mist-500">{t('pointsLabel')}</p>
        </div>

        <p className="mt-5 text-xs text-mist-500">{t('rankTeaser')}</p>
      </Card>
    </Container>
  );
}
