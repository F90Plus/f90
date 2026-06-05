'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { fadeUp, staggerParent, viewportOnce } from '@/lib/motion';
import type { TournamentMeta } from '@/lib/football/tournament';
import { StatCounter } from './stat-counter';

/** The opener of the Tournament Center: the field, set, in four counts + the Analyst's framing. */
export function FieldIsSet({ meta }: { meta: TournamentMeta }) {
  const t = useTranslations('tournament.field');

  if (meta.source === 'fallback' || meta.nationCount === 0) return null;

  const stats = [
    { value: meta.nationCount, label: t('nations') },
    { value: meta.groupCount, label: t('groups') },
    { value: meta.matchCount, label: t('matches') },
    { value: meta.venueCount, label: t('venues') },
  ];

  return (
    <section id="tournament" className="relative scroll-mt-24 py-16 sm:py-24">
      <Container className="flex flex-col items-center gap-10 text-center">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <SectionHeading
            align="center"
            eyebrow={t('eyebrow')}
            title={t('title')}
            subtitle={t('analyst')}
          />
        </motion.div>

        <motion.div
          variants={staggerParent(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid w-full max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <StatCounter value={s.value} label={s.label} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
