import { setRequestLocale } from 'next-intl/server';
import { getWorldCupStatus } from '@/lib/football/nations';
import { getGlobalRankings } from '@/lib/rankings';
import { Hero } from '@/features/home/hero';
import { MarketTicker } from '@/features/markets/market-ticker';
import { TournamentCenter } from '@/features/tournament/tournament-center';
import { HowItWorks } from '@/features/home/how-it-works';
import { FantasyTeaser } from '@/features/home/fantasy-teaser';
import { LeaderboardTeaser } from '@/features/home/leaderboard-teaser';
import { CtaBand } from '@/features/home/cta-band';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Globe country states from the real source (cache-first). The Tournament Center
  // does its own openfootball read — Next dedupes the identical fetch within the request.
  // Rankings come from the real global_rankings view (empty until Phase 2 scoring),
  // read via the cookie-less public client so the homepage stays cacheable.
  const [wcStatus, rankings] = await Promise.all([getWorldCupStatus(), getGlobalRankings()]);

  return (
    <>
      {/* The live-market bar leads the page — pinned under the header, above the Hero. */}
      <MarketTicker />
      <Hero wcStatus={wcStatus} />
      <div id="tournament" className="scroll-mt-24">
        <TournamentCenter />
      </div>
      <HowItWorks />
      <FantasyTeaser />
      <LeaderboardTeaser entries={rankings} />
      <CtaBand />
    </>
  );
}
