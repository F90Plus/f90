import { setRequestLocale } from 'next-intl/server';
import { getWorldCupStatus } from '@/lib/football/nations';
import { Hero } from '@/features/home/hero';
import { MarketTicker } from '@/features/markets/market-ticker';
import { TournamentCenter } from '@/features/tournament/tournament-center';
import { HowItWorks } from '@/features/home/how-it-works';
import { LeaderboardTeaser } from '@/features/home/leaderboard-teaser';
import { CtaBand } from '@/features/home/cta-band';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Globe country states from the real source (cache-first). The Tournament Center
  // does its own openfootball read — Next dedupes the identical fetch within the request.
  const wcStatus = await getWorldCupStatus();

  return (
    <>
      {/* The live-market bar leads the page — pinned under the header, above the Hero. */}
      <MarketTicker />
      <Hero wcStatus={wcStatus} />
      <TournamentCenter />
      <HowItWorks />
      <LeaderboardTeaser />
      <CtaBand />
    </>
  );
}
