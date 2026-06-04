import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';
import { getCountries } from '@/features/profile/countries';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'app' });
  return { title: t('home.metaTitle'), robots: { index: false } };
}

export default async function AppHomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // the (app) layout already guaranteed a session

  const [t, profileRes, walletRes, countries] = await Promise.all([
    getTranslations('app'),
    supabase.from('profiles').select('username, total_points, country_code').eq('id', user.id).single(),
    supabase.from('wallets').select('coins_balance').eq('user_id', user.id).single(),
    getCountries(locale),
  ]);

  const handle = profileRes.data?.username ?? '';
  const points = profileRes.data?.total_points ?? 0;
  const balance = walletRes.data?.coins_balance ?? 0;
  const country = countries.find((c) => c.code === profileRes.data?.country_code) ?? null;

  return (
    <Container className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">{t('home.eyebrow')}</p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t('home.greeting', { handle })}
        </h1>
        <p className="mt-2 text-mist-300">{t('home.subtitle')}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-wider text-mist-500">{t('home.balanceLabel')}</p>
            <p className="nums mt-2 font-display text-3xl font-bold text-lime-300">
              {t('home.balanceValue', { amount: balance })}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-xs uppercase tracking-wider text-mist-500">{t('home.pointsLabel')}</p>
            <p className="nums mt-2 font-display text-3xl font-bold text-white">
              {t('home.pointsValue', { points })}
            </p>
            {country && (
              <p className="mt-4 flex items-center gap-2 text-sm text-mist-300">
                {country.flag ? (
                  <span
                    aria-hidden
                    className="block h-5 w-5 shrink-0 rounded-full bg-cover bg-center ring-1 ring-mist-200/15"
                    style={{ backgroundImage: `url(${country.flag})` }}
                  />
                ) : null}
                {t('home.backing', { country: country.name })}
              </p>
            )}
          </Card>
        </div>

        <div className="mt-8 rounded-card border border-mist-500/10 bg-night-900/40 p-6">
          <p className="text-sm text-mist-300">{t('home.soon')}</p>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'mt-4')}
          >
            {t('home.exploreCta')}
          </Link>
        </div>
      </div>
    </Container>
  );
}
