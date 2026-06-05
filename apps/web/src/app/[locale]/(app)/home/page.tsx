import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { getCountries } from '@/features/profile/countries';
import { HomeAtmosphere } from '@/features/home/home-atmosphere';
import { getPredictableFixtures, getUserPredictions } from '@/features/predictions/queries';
import { splitFeatured, recentPredictions } from '@/features/predictions/home-model';
import { PredictCard } from '@/features/predictions/predict-card';
import { MyPredictionsStrip } from '@/features/predictions/my-predictions-strip';
import { Link } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

/** How many recent predictions the /home strip shows (full history at /predictions). */
const RECENT_LIMIT = 4;

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

  const [t, tRanking, profileRes, walletRes, countries, fixtures, predictions] = await Promise.all([
    getTranslations('app'),
    getTranslations('ranking'),
    supabase.from('profiles').select('username, total_points, country_code').eq('id', user.id).single(),
    supabase.from('wallets').select('coins_balance').eq('user_id', user.id).single(),
    getCountries(locale),
    getPredictableFixtures(supabase),
    getUserPredictions(supabase),
  ]);

  const handle = profileRes.data?.username ?? '';
  const points = profileRes.data?.total_points ?? 0;
  const balance = walletRes.data?.coins_balance ?? 0;
  const country = countries.find((c) => c.code === profileRes.data?.country_code) ?? null;

  // Rank is only meaningful once the player has scored — pre-Phase-2 everyone ties
  // at the top, so an unscored player honestly reads "—" (no query needed). When
  // scored, read their position from the world-readable global_rankings view.
  const rank = points > 0 ? await fetchRank(supabase, user.id) : null;

  const { featured, rest } = splitFeatured(fixtures);
  const recent = recentPredictions(predictions, RECENT_LIMIT);

  return (
    <>
      <HomeAtmosphere />
      <Container className="py-10 sm:py-12">
        {/* ── STANDING STRIP ─────────────────────────────────────────────── */}
        <Card className="flex flex-wrap items-center gap-x-6 gap-y-4 p-5 sm:px-6">
          <h1 className="mr-auto font-display text-[1.3rem] font-bold tracking-tight text-mist-50 sm:text-2xl">
            {t('home.greeting', { handle })}
          </h1>

          <Stat label={t('home.tokensLabel')} value={t('home.tokensValue', { amount: balance })} tone="lime" />
          <Stat label={t('home.pointsLabel')} value={t('home.pointsValue', { points })} tone="white" />
          <Link
            href="/ranking"
            className="flex flex-col gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400"
            aria-label={tRanking('seeRanking')}
          >
            <Stat
              label={t('home.rankLabel')}
              value={rank == null ? t('home.rankUnranked') : t('home.rankValue', { rank })}
              tone="led"
            />
          </Link>

          {country ? (
            <span className="inline-flex items-center gap-2 text-[0.8rem] text-mist-300">
              <CountryFlag flag={country.flag} accent={country.accent} />
              {t('home.backing', { country: country.name })}
            </span>
          ) : null}
        </Card>

        {/* ── HAZ TU PREDICCIÓN — featured fixture as the hero card ───────── */}
        <section className="mt-10">
          <div className="mb-3.5 flex items-end justify-between gap-3">
            <div>
              <span className="eyebrow">{t('home.predict.eyebrow')}</span>
              <h2 className="mt-2 font-display text-2xl font-extrabold text-mist-50 sm:text-[1.7rem]">
                {t('home.predict.title')}
              </h2>
            </div>
            {fixtures.length > 0 ? (
              <Link
                href="/#tournament"
                className="shrink-0 rounded text-[0.8rem] font-semibold text-led-300 transition-colors hover:text-led-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400"
              >
                {t('home.predict.seeAll')} →
              </Link>
            ) : null}
          </div>

          {featured ? (
            <div className="mx-auto max-w-xl">
              <PredictCard fixture={featured} />
            </div>
          ) : (
            <FixturesPreparing
              title={t('home.fixturesPreparing.title')}
              body={t('home.fixturesPreparing.body')}
            />
          )}
        </section>

        {/* ── PRÓXIMOS PARTIDOS — the remaining fixtures ─────────────────── */}
        {rest.length > 0 ? (
          <section className="mt-10">
            <div className="mb-3.5 flex items-end justify-between gap-3">
              <h2 className="font-display text-2xl font-extrabold text-mist-50">{t('home.upcoming.title')}</h2>
              <Link
                href="/#tournament"
                className="shrink-0 rounded text-[0.8rem] font-semibold text-led-300 transition-colors hover:text-led-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400"
              >
                {t('home.upcoming.seeAll')} →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((fixture) => (
                <PredictCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          </section>
        ) : null}

        {/* ── MIS PREDICCIONES — recent calls + honest empty state ───────── */}
        <section className="mt-10">
          <div className="mb-3.5 flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold text-mist-50">{t('home.myPredictions.title')}</h2>
            {recent.length > 0 ? (
              <Link
                href="/predictions"
                className="shrink-0 rounded text-[0.8rem] font-semibold text-led-300 transition-colors hover:text-led-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400"
              >
                {t('home.myPredictions.seeAll')} →
              </Link>
            ) : null}
          </div>
          <MyPredictionsStrip predictions={recent} />
        </section>
      </Container>
    </>
  );
}

/**
 * The backed country's real flag for the standing strip — the vendored asset when
 * available, else the country's accent as a small chip. Decorative (the country
 * name is shown as text alongside). Keyed by the resolved `flag`/`accent` from the
 * countries seed, NOT a 3-letter team code (so it never mis-resolves).
 */
function CountryFlag({ flag, accent }: { flag: string | null; accent: string }) {
  if (flag) {
    return (
      <span
        aria-hidden
        className="block h-[14px] w-[20px] shrink-0 rounded-[3px] bg-cover bg-center ring-1 ring-mist-200/15"
        style={{ backgroundImage: `url(${flag})` }}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="block h-[14px] w-[20px] shrink-0 rounded-[3px] ring-1 ring-mist-200/15"
      style={{ background: `linear-gradient(135deg, ${accent}, ${accent}99)` }}
    />
  );
}

/** A labelled standing-strip stat (tabular value, toned accent). */
function Stat({ label, value, tone }: { label: string; value: string; tone: 'lime' | 'white' | 'led' }) {
  const toneClass = tone === 'lime' ? 'text-lime-300' : tone === 'led' ? 'text-led-300' : 'text-mist-50';
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.6rem] uppercase tracking-[0.16em] text-mist-500">{label}</span>
      <span className={`nums font-display text-[1.25rem] font-extrabold leading-none ${toneClass}`}>{value}</span>
    </div>
  );
}

/**
 * Honest "fixtures are being prepared" state — shown when no upcoming fixtures are
 * synced yet (or pre-migration). Premium + on-brand, never a broken void.
 */
function FixturesPreparing({ title, body }: { title: string; body: string }) {
  return (
    <Card className="mx-auto max-w-xl px-6 py-10 text-center">
      <span
        aria-hidden
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-led-400/22 bg-led-500/[0.12]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 15.5 L10 12 L14 13.5 L19 6.5"
            stroke="var(--color-volt-300)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="19" cy="6.5" r="2.3" className="fill-gold-400" />
        </svg>
      </span>
      <p className="font-display text-[1.05rem] font-bold text-mist-100">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[0.85rem] leading-relaxed text-mist-400">{body}</p>
    </Card>
  );
}

/**
 * The signed-in user's rank from the world-readable `global_rankings` view.
 * Degrades to null on any failure (missing view / absent env / RLS) so the strip
 * shows "—", never a 500. Only called when the user has a positive score.
 */
async function fetchRank(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number | null> {
  try {
    const { data, error } = await supabase
      .from('global_rankings')
      .select('rank')
      .eq('user_id', userId)
      .single();
    if (error || !data) return null;
    return (data as { rank: number }).rank;
  } catch {
    return null;
  }
}
