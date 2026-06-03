'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { PLAY_HREF } from '@/lib/constants';
import { leaderboard } from '@/data/leaderboard';
import { ATMOSPHERE } from '@/lib/atmosphere';
import { CinematicImageLayer } from '@/components/atmosphere/cinematic-image-layer';

const ROW = 'grid grid-cols-[2rem_1fr_auto] items-center gap-4 px-6';

export function LeaderboardTeaser() {
  const t = useTranslations('leaderboard');

  return (
    <section id="leaderboard" className="relative overflow-hidden py-16 sm:py-24">
      {/* globe of nations — "the world is predicting", faint from the right */}
      <CinematicImageLayer
        src={ATMOSPHERE.globeFlags}
        className="absolute inset-0"
        imageClassName="object-cover object-right opacity-25 [mask-image:linear-gradient(to_left,black,transparent_70%)]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-night-950/55" />
      <Container className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
          <Card className="overflow-hidden">
            <div
              className={cn(
                ROW,
                'border-b border-mist-500/10 py-3 text-[0.7rem] uppercase tracking-widest text-mist-500',
              )}
            >
              <span>{t('colRank')}</span>
              <span>{t('colPlayer')}</span>
              <span className="text-right">{t('colPoints')}</span>
            </div>

            <ul>
              {leaderboard.map((entry) => (
                <li
                  key={entry.rank}
                  className={cn(ROW, 'py-3 transition-colors hover:bg-night-800/50')}
                >
                  <span
                    className={cn(
                      'nums font-display font-bold',
                      entry.rank <= 3 ? 'text-gold-400' : 'text-mist-400',
                    )}
                  >
                    {entry.rank}
                  </span>
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-7 w-7 shrink-0 rounded-lg"
                      style={{
                        background: `linear-gradient(140deg, ${entry.accent}, ${entry.accent}88)`,
                      }}
                    />
                    <span className="truncate text-sm text-mist-100">{entry.alias}</span>
                  </div>
                  <span className="nums text-right text-sm font-semibold text-mist-200">
                    {t('points', { points: entry.points })}
                  </span>
                </li>
              ))}

              <li
                className={cn(
                  ROW,
                  'border-t border-dashed border-led-500/30 bg-led-500/5 py-3',
                )}
              >
                <span className="nums font-display font-bold text-led-300">+</span>
                <span className="text-sm font-semibold text-led-300">{t('you')}</span>
                <a
                  href={PLAY_HREF}
                  className={cn(buttonVariants({ size: 'sm' }), 'justify-self-end')}
                >
                  {t('joinCta')}
                </a>
              </li>
            </ul>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}
