import { setRequestLocale } from 'next-intl/server';
import { getHomeMatches } from '@/lib/football';
import { Hero } from '@/features/home/hero';
import { MatchesRail } from '@/features/home/matches-rail';
import { HowItWorks } from '@/features/home/how-it-works';
import { LeaderboardTeaser } from '@/features/home/leaderboard-teaser';
import { CtaBand } from '@/features/home/cta-band';
import { AnalystSection } from '@/features/copilot/analyst-section';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Real WC2026 fixtures (openfootball, cache-first) with graceful mock fallback.
  const matches = await getHomeMatches();
  const featured = matches[0];

  return (
    <>
      {featured ? <Hero featured={featured} /> : null}
      <MatchesRail matches={matches} />
      {featured ? <AnalystSection featured={featured} /> : null}
      <HowItWorks />
      <LeaderboardTeaser />
      <CtaBand />
    </>
  );
}
