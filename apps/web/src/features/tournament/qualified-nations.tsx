'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fadeUp, staggerParent } from '@/lib/motion';
import { CONFEDERATIONS, type Confederation } from '@/lib/football/confederations';
import type { TournamentGroup } from '@/lib/football/tournament';
import { NationCard } from './nation-card';

type Filter = Confederation | 'ALL';

/** The 48, explorable — filter by confederation. The globe's roster, unfolded. */
export function QualifiedNations({ groups }: { groups: TournamentGroup[] }) {
  const t = useTranslations('tournament.nations');

  const nations = useMemo(
    () => groups.flatMap((g) => g.teams.map((team) => ({ team, groupId: g.id }))),
    [groups],
  );
  const available = useMemo(
    () => new Set(nations.map((n) => n.team.confederation)),
    [nations],
  );
  const [filter, setFilter] = useState<Filter>('ALL');

  if (nations.length === 0) return null;

  const shown = filter === 'ALL' ? nations : nations.filter((n) => n.team.confederation === filter);
  const chips: { id: Filter; label: string }[] = [
    { id: 'ALL', label: t('all') },
    ...CONFEDERATIONS.filter((c) => available.has(c.id)).map((c) => ({
      id: c.id as Filter,
      label: c.label,
    })),
  ];

  return (
    <section className="relative py-16 sm:py-24">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilter(c.id)}
                aria-pressed={filter === c.id}
                className={cn(
                  buttonVariants({ variant: filter === c.id ? 'primary' : 'secondary', size: 'sm' }),
                  'shrink-0',
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={filter}
          variants={staggerParent(0.02)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        >
          {shown.map(({ team, groupId }) => (
            <motion.div key={team.code} variants={fadeUp}>
              <NationCard team={team} groupId={groupId} />
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-xs text-mist-500">{t('count', { count: shown.length })}</p>
      </Container>
    </section>
  );
}
