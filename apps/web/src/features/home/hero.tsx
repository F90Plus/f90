'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { fadeUp, staggerParent } from '@/lib/motion';
import { PLAY_HREF } from '@/lib/constants';
import { WELCOME_BONUS_TOKENS } from '@/lib/economy';
import { Logo } from '@/components/layout/logo';
import { StadiumScene } from '@/components/atmosphere/stadium-scene';
import { GlobeMount } from '@/features/globe/globe-mount';
import type { WorldCupStatus } from '@/lib/football/nations';
import { Countdown } from './countdown';

function ChipDot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />;
}

/**
 * Hero — the World Cup globe as the centerpiece (GLOBE_HERO_SPEC, D-022). One night
 * scene: stadium backdrop → living globe (focal point) → countdown pedestal → copy as a
 * broadcast lower-third. Mobile is emotion-first (globe + countdown own the first
 * impact; CTAs hinted just below the fold). The globe's country states are real
 * (D-023): gold hosts + green qualified + neutral rest.
 */
export function Hero({ wcStatus }: { wcStatus: WorldCupStatus }) {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-24">
      <StadiumScene />

      <Container>
        <div className="hero-grid relative z-10">
          {/* brand + headline */}
          <motion.div
            variants={staggerParent(0.1, 0.05)}
            initial="hidden"
            animate="show"
            className="hero-area-head flex flex-col items-start gap-5 lg:self-end"
          >
            <motion.div variants={fadeUp}>
              <Logo height={80} glow="lg" priority href={null} />
            </motion.div>
            <motion.div variants={fadeUp}>
              <Badge tone="led" className="backdrop-blur">
                {t('eyebrow')}
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl leading-[1.04] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.9rem]"
            >
              <span className="block text-mist-50">{t('titleLead')}</span>
              <span className="text-gradient text-gradient-sheen block">{t('titleHighlight')}</span>
            </motion.h1>
          </motion.div>

          {/* globe centerpiece + countdown pedestal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="hero-area-globe flex flex-col items-center gap-5"
          >
            <GlobeMount status={wcStatus} />
            <div className="relative w-full max-w-[460px]">
              <div className="pointer-events-none absolute -top-5 left-1/2 h-16 w-[110%] -translate-x-1/2 rounded-[50%] bg-led-500/15 blur-2xl" />
              <Countdown />
            </div>
          </motion.div>

          {/* subtitle + CTAs + chips (broadcast lower-third) */}
          <motion.div
            variants={staggerParent(0.08, 0.05)}
            initial="hidden"
            animate="show"
            className="hero-area-details flex flex-col items-start gap-5 lg:self-start"
          >
            <motion.p variants={fadeUp} className="max-w-xl text-lg text-mist-300">
              {t('subtitle')}
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center"
            >
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
            <motion.ul variants={fadeUp} className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist-400">
              <li className="flex items-center gap-2">
                <ChipDot />
                {t('chipFree')}
              </li>
              <li className="flex items-center gap-2">
                <ChipDot />
                {t('chipCoins', { amount: WELCOME_BONUS_TOKENS })}
              </li>
              <li className="flex items-center gap-2">
                <ChipDot />
                {t('chipRanking')}
              </li>
            </motion.ul>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
