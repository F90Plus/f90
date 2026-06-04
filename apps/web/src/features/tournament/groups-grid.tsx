'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { fadeUp, staggerParent, viewportOnce } from '@/lib/motion';
import type { TournamentGroup } from '@/lib/football/tournament';
import { toughestGroupId } from '@/lib/football/analysis';
import { GroupCard } from './group-card';
import { AnalystNote } from './analyst-note';

/** The draw — twelve groups as set in Washington, with the Analyst's group-of-death read. */
export function GroupsGrid({ groups }: { groups: TournamentGroup[] }) {
  const t = useTranslations('tournament.groups');

  if (groups.length === 0) return null;
  const toughest = toughestGroupId(groups);

  return (
    <section id="groups" className="relative scroll-mt-24 py-16 sm:py-24">
      <Container className="flex flex-col gap-8">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
        {toughest ? <AnalystNote>{t('analyst', { group: toughest })}</AnalystNote> : null}
        <motion.div
          variants={staggerParent(0.05)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {groups.map((g) => (
            <motion.div key={g.id} variants={fadeUp}>
              <GroupCard group={g} isToughest={g.id === toughest} />
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
