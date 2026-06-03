'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { fadeUp, staggerParent } from '@/lib/motion';
import { PLAY_HREF } from '@/lib/constants';
import type { HomeMatch } from '@/lib/football/types';
import { Logo } from '@/components/layout/logo';
import { StadiumScene } from '@/components/atmosphere/stadium-scene';
import { BroadcastOverlay } from '@/components/atmosphere/broadcast-overlay';
import { Countdown } from './countdown';
import { MatchCard } from './match-card';

function ChipDot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />;
}

export function Hero({ featured }: { featured: HomeMatch }) {
  const t = useTranslations('hero');
  const tc = useTranslations('common');

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
      <StadiumScene />

      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <motion.div
            variants={staggerParent(0.1, 0.05)}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-7"
          >
            <motion.div variants={fadeUp}>
              <Logo height={88} glow="lg" priority href={null} />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Badge tone="led" className="backdrop-blur">
                {t('eyebrow')}
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl leading-[1.04] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-[4.25rem]"
            >
              <span className="block text-mist-50">{t('titleLead')}</span>
              <span className="text-gradient text-gradient-sheen block">{t('titleHighlight')}</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="max-w-xl text-lg text-mist-300">
              {t('subtitle')}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
              <a href={PLAY_HREF} className={buttonVariants({ size: 'lg' })}>
                {t('ctaPrimary')}
              </a>
              <a
                href="#how-it-works"
                className={buttonVariants({ variant: 'secondary', size: 'lg' })}
              >
                {t('ctaSecondary')}
              </a>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist-400"
            >
              <li className="flex items-center gap-2">
                <ChipDot />
                {t('chipFree')}
              </li>
              <li className="flex items-center gap-2">
                <ChipDot />
                {t('chipCoins')}
              </li>
              <li className="flex items-center gap-2">
                <ChipDot />
                {t('chipRanking')}
              </li>
            </motion.ul>
          </motion.div>

          {/* Featured fixture + countdown */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="flex flex-col gap-5"
          >
            <div className="relative">
              <div className="absolute -top-3 -left-3 z-20">
                <Badge tone="gold" className="glass gap-2">
                  <span className="animate-live-pulse h-1.5 w-1.5 rounded-full bg-lime-400" />
                  {t('featured')}
                </Badge>
              </div>
              <MatchCard match={featured} featured />
              <p className="mt-3 text-center text-xs text-mist-500">
                {t('cardPrompt')} · {t('cardHint')}
              </p>
            </div>
            <Countdown />
          </motion.div>
        </div>
      </Container>

      <BroadcastOverlay
        label={tc('worldCup')}
        className="absolute right-6 bottom-6 z-10 hidden sm:flex"
      />
    </section>
  );
}
