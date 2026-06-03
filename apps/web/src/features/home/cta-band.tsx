'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { buttonVariants } from '@/components/ui/button';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { PLAY_HREF } from '@/lib/constants';
import { ATMOSPHERE } from '@/lib/atmosphere';
import { CinematicImageLayer } from '@/components/atmosphere/cinematic-image-layer';

export function CtaBand() {
  const t = useTranslations('cta');

  return (
    <section id="cta" className="relative py-16 sm:py-24">
      <Container>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="glass hairline grain relative overflow-hidden rounded-xl2 px-6 py-14 text-center sm:px-12 sm:py-20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-led-500/25 blur-[100px]"
          />
          {/* real stadium behind the closing CTA, treated very dark for legibility */}
          <CinematicImageLayer
            src={ATMOSPHERE.stadiumWide}
            className="absolute inset-0"
            imageClassName="object-cover opacity-30"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-night-950/70" />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6">
            <h2 className="font-display text-3xl font-extrabold text-balance text-mist-50 sm:text-5xl">
              {t('title')}
            </h2>
            <p className="text-lg text-mist-300">{t('subtitle')}</p>
            <a href={PLAY_HREF} className={buttonVariants({ size: 'lg' })}>
              {t('button')}
            </a>
            <p className="text-xs text-mist-500">{t('disclaimer')}</p>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
