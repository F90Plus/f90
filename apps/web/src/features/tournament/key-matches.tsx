import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { insightFromStrengths } from '@/lib/copilot';
import { homeAdvantageFor } from '@/lib/football/model';
import type { HomeMatch } from '@/lib/football/types';
import { MatchCard } from '@/features/home/match-card';
import { AnalystCard } from '@/features/copilot/analyst-card';

/**
 * Key matches — the marquee tie read in full by the Analyst, plus the supporting grid.
 * Server component: the insight is computed on the server (deterministic engine) and
 * the plain MatchInsight is handed to the client AnalystCard — same pattern as the
 * homepage Analyst, so the copilot engine never enters the client bundle.
 */
export function KeyMatches({ matches }: { matches: HomeMatch[] }) {
  const t = useTranslations('tournament.key');

  if (matches.length === 0) return null;
  const [featured, ...rest] = matches;
  const insight = featured
    ? insightFromStrengths({
        fixtureId: featured.id,
        home: { code: featured.home.code, name: featured.home.name },
        away: { code: featured.away.code, name: featured.away.name },
        homeStrength: featured.home.strength,
        awayStrength: featured.away.strength,
        homeAdvantage: homeAdvantageFor(featured.home.name),
      })
    : null;

  return (
    <section id="analyst" className="relative scroll-mt-24 py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {insight ? <AnalystCard insight={insight} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {rest.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
