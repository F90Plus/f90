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
import { avatarColors, avatarInitial } from '@/lib/avatar';
import type { RankingEntry } from '@/lib/rankings';
import { ATMOSPHERE } from '@/lib/atmosphere';
import { CinematicImageLayer } from '@/components/atmosphere/cinematic-image-layer';

const ROW = 'grid grid-cols-[2rem_1fr_auto] items-center gap-4 px-6';

/**
 * Homepage rankings teaser — reads the REAL global board (T9). Before Phase 2
 * scoring nobody has points, so `entries` is empty and we render an honest,
 * premium empty-state ("open seats" waiting to be claimed) instead of fabricated
 * names. Once players score, the same board fills with real rows — own-IP avatar
 * token (D-025) + nation flag. No mock data, ever (the F90+ honesty rule).
 */
export function LeaderboardTeaser({ entries }: { entries: RankingEntry[] }) {
  const t = useTranslations('leaderboard');
  const isEmpty = entries.length === 0;

  return (
    <section id="leaderboard" className="relative scroll-mt-24 overflow-hidden py-16 sm:py-24">
      {/* globe of nations — "the world is predicting", faint from the right */}
      <CinematicImageLayer
        src={ATMOSPHERE.globeFlags}
        className="absolute inset-0"
        imageClassName="object-cover object-right opacity-25 [mask-image:linear-gradient(to_left,black,transparent_70%)]"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-night-950/55" />
      <Container className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <SectionHeading
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={isEmpty ? t('subtitleEmpty') : t('subtitle')}
        />

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
              {/* Real ranked players (Phase 2+) — own-IP avatar token + nation flag. */}
              {entries.map((entry) => {
                const { from, to } = avatarColors(entry.username);
                const name = entry.displayName || `@${entry.username}`;
                return (
                  <li
                    key={entry.username}
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
                        aria-hidden
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[0.6rem] font-bold text-night-950"
                        style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
                      >
                        {avatarInitial(name)}
                      </span>
                      <span className="truncate text-sm text-mist-100">{name}</span>
                      {entry.flag && (
                        <span
                          aria-hidden
                          className="block h-4 w-4 shrink-0 rounded-full bg-cover bg-center ring-1 ring-mist-200/15"
                          style={{ backgroundImage: `url(${entry.flag})` }}
                        />
                      )}
                    </div>
                    <span className="nums text-right text-sm font-semibold text-mist-200">
                      {t('points', { points: entry.points })}
                    </span>
                  </li>
                );
              })}

              {/* Empty board (Phase 1) — premium "open seats" on the podium. */}
              {isEmpty &&
                [1, 2, 3].map((rank) => (
                  <li key={rank} aria-hidden className={cn(ROW, 'py-3')}>
                    <span
                      className={cn(
                        'nums font-display font-bold',
                        rank <= 3 ? 'text-gold-400/45' : 'text-mist-500',
                      )}
                    >
                      {rank}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="h-7 w-7 shrink-0 rounded-lg border border-dashed border-mist-500/25 bg-night-800/30" />
                      <span className="h-2.5 w-24 rounded-full bg-mist-500/10 motion-safe:animate-pulse" />
                    </div>
                    <span className="text-right text-sm text-mist-600">—</span>
                  </li>
                ))}

              {/* The conversion row — your seat is open. */}
              <li className={cn(ROW, 'border-t border-dashed border-led-500/30 bg-led-500/5 py-3')}>
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
