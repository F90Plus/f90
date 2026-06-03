'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { fadeUp, staggerParent, viewportOnce } from '@/lib/motion';
import type { HomeMatch } from '@/lib/football/types';
import { MatchCard } from './match-card';

export function MatchesRail({ matches }: { matches: HomeMatch[] }) {
  const t = useTranslations('matches');
  const rail = matches.slice(1); // matches[0] is featured in the hero

  return (
    <section id="matches" className="relative py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
          <a
            href="#cta"
            className="text-sm font-semibold text-led-300 transition-colors hover:text-led-400"
          >
            {t('viewAll')} →
          </a>
        </div>

        <motion.div
          variants={staggerParent(0.08)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {rail.map((match) => (
            <motion.div key={match.id} variants={fadeUp}>
              <MatchCard match={match} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
