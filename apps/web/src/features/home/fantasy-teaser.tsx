'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { buttonVariants } from '@/components/ui/button';
import { XiPitch } from '@/features/fantasy/xi-pitch';
import { fadeUp, staggerParent, viewportOnce } from '@/lib/motion';
import { PLAY_HREF } from '@/lib/constants';
import { cn } from '@/lib/utils';

const STEP_KEYS = ['earn', 'markets', 'trade', 'squad', 'xi', 'bench', 'compete'] as const;
const ROAD = ['groups', 'r16', 'qf', 'sf', 'final'] as const;

/**
 * Fantasy discovery — the landing's "F90+ is bigger than predictions" beat, rooted
 * emotionally in the 2026 World Cup: you're not arranging tokens, you're building a
 * *selection for the tournament* and chasing the road to the final. A rich XI Ideal
 * pitch (own-IP, D-025) + the ecosystem loop. A teaser, not a product — the "soon"
 * tag keeps it honest. Premium, no casino, no noise.
 */
export function FantasyTeaser() {
  const t = useTranslations('fantasy');

  return (
    <section id="fantasy" className="relative scroll-mt-24 py-16 sm:py-24">
      <Container className="flex flex-col items-center gap-8">
        <SectionHeading
          align="center"
          className="mx-auto"
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
        />

        {/* Road to the final — you're building a squad for the whole journey. */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="flex flex-col items-center gap-2.5"
        >
          <span className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-widest text-mist-500">
            {t('road.title')}
            <span className="inline-flex rounded-pill border border-volt-400/25 bg-volt-500/10 px-2 py-0.5 text-[0.6rem] font-semibold normal-case tracking-wide text-volt-300">
              {t('tag')}
            </span>
          </span>
          <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
            {ROAD.map((k, i) => (
              <li key={k} className="flex items-center gap-2">
                <span
                  className={cn(
                    'rounded-pill border px-3 py-1 text-xs font-semibold',
                    k === 'final'
                      ? 'glow-gold border-gold-400/40 bg-gold-400/10 text-gold-300'
                      : 'border-mist-500/20 bg-night-800/60 text-mist-300',
                  )}
                >
                  {t(`road.${k}`)}
                </span>
                {i < ROAD.length - 1 ? (
                  <span className="text-mist-600" aria-hidden>
                    →
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <span className="nums text-[0.7rem] font-medium text-gold-300/80">{t('road.venue')}</span>
        </motion.div>

        <div className="mt-4 grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* The XI Ideal pitch */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex justify-center"
          >
            <XiPitch />
          </motion.div>

          {/* The ecosystem loop */}
          <motion.div
            variants={staggerParent(0.08)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col gap-5"
          >
            <ol className="flex flex-col gap-3">
              {STEP_KEYS.map((key, i) => (
                <motion.li key={key} variants={fadeUp} className="flex items-center gap-4">
                  <span className="nums flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-led-400/30 bg-night-800/60 font-display text-sm font-bold text-led-200">
                    {i + 1}
                  </span>
                  <span className="text-sm text-mist-200 sm:text-base">{t(`steps.${key}`)}</span>
                </motion.li>
              ))}
            </ol>
            <motion.div variants={fadeUp}>
              <a href={PLAY_HREF} className={cn(buttonVariants({ size: 'lg' }), 'mt-2')}>
                {t('cta')}
              </a>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
