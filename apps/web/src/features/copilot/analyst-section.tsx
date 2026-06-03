import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { insightFromStrengths } from '@/lib/copilot';
import { homeAdvantageFor } from '@/lib/football/model';
import type { HomeMatch } from '@/lib/football/types';
import { AnalystCard } from './analyst-card';

/**
 * Homepage "Meet your Analyst" section. Runs the deterministic engine on the
 * server for the featured REAL fixture, from team strengths (elo + host
 * advantage). Synchronous → fully static, no Suspense. Enriches automatically as
 * live data sources connect.
 */
export function AnalystSection({ featured }: { featured: HomeMatch }) {
  const t = useTranslations('copilot');
  const insight = insightFromStrengths({
    fixtureId: featured.id,
    home: { code: featured.home.code, name: featured.home.name },
    away: { code: featured.away.code, name: featured.away.name },
    homeStrength: featured.home.strength,
    awayStrength: featured.away.strength,
    homeAdvantage: homeAdvantageFor(featured.home.name),
  });

  return (
    <section id="analyst" className="relative py-16 sm:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionHeading
          eyebrow={t('sectionEyebrow')}
          title={t('sectionTitle')}
          subtitle={t('sectionSubtitle')}
        />
        <AnalystCard insight={insight} />
      </Container>
    </section>
  );
}
