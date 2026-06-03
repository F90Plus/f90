import { setRequestLocale } from 'next-intl/server';
import { getHomeMatches } from '@/lib/football';
import { getWorldCupStatus } from '@/lib/football/nations';
import { Hero } from '@/features/home/hero';
import { MatchesRail } from '@/features/home/matches-rail';
import { HowItWorks } from '@/features/home/how-it-works';
import { LeaderboardTeaser } from '@/features/home/leaderboard-teaser';
import { CtaBand } from '@/features/home/cta-band';
import { AnalystSection } from '@/features/copilot/analyst-section';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Real WC2026 fixtures + globe country states — both from real sources, cache-first.
  const [matches, wcStatus] = await Promise.all([getHomeMatches(), getWorldCupStatus()]);
  const featured = matches[0];

  return (
    <>
      <Hero wcStatus={wcStatus} />
      <MatchesRail matches={matches} />
      {featured ? <AnalystSection featured={featured} /> : null}
      <HowItWorks />
      <LeaderboardTeaser />
      <CtaBand />
    </>
  );
}
