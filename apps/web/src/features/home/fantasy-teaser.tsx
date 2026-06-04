'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { buttonVariants } from '@/components/ui/button';
import { fadeUp, staggerParent, viewportOnce } from '@/lib/motion';
import { PLAY_HREF } from '@/lib/constants';
import { cn } from '@/lib/utils';

// 4-3-3, rows top (attack) → bottom (keeper). The middle forward is the "marquee" token.
const FORMATION = [
  { line: 'fwd', count: 3 },
  { line: 'mid', count: 3 },
  { line: 'def', count: 4 },
  { line: 'gk', count: 1 },
] as const;

const STEP_KEYS = ['earn', 'markets', 'trade', 'squad', 'xi', 'bench', 'compete'] as const;

function PlayerToken({ label, star }: { label: string; star?: boolean }) {
  return (
    <span
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full text-[0.55rem] font-bold ring-1 sm:h-11 sm:w-11',
        star
          ? 'glow-gold bg-gold-400 text-night-950 ring-gold-300'
          : 'glass text-mist-200 ring-led-400/20',
      )}
    >
      {label}
    </span>
  );
}

/**
 * Fantasy discovery — the landing's "F90+ is bigger than predictions" beat. A
 * stylised XI on the pitch (own-IP tokens, D-025) + the ecosystem loop (earn
 * Tokens F90 → markets → trade players → squad → XI → bench → rankings). A teaser,
 * not a product: a "soon" tag keeps it honest. Premium, no casino, no noise.
 */
export function FantasyTeaser() {
  const t = useTranslations('fantasy');

  return (
    <section id="fantasy" className="relative py-16 sm:py-24">
      <Container>
        <SectionHeading
          align="center"
          className="mx-auto"
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* The pitch + an XI + bench */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="flex flex-col items-center"
          >
            <div
              className="pitch-markings relative aspect-[3/4] w-full max-w-[340px] overflow-hidden rounded-card border border-pitch-500/20"
              style={{
                background:
                  'linear-gradient(180deg, color-mix(in oklab, var(--color-pitch-500) 11%, transparent), color-mix(in oklab, var(--color-night-900) 92%, transparent))',
              }}
            >
              <span className="absolute right-3 top-3 z-10 rounded-pill border border-volt-400/25 bg-volt-500/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-volt-300">
                {t('tag')}
              </span>
              <div className="absolute inset-0 flex flex-col justify-between px-6 py-7">
                {FORMATION.map((row) => (
                  <div key={row.line} className="flex items-center justify-around">
                    {Array.from({ length: row.count }).map((_, i) => (
                      <PlayerToken
                        key={i}
                        label={t(`pos.${row.line}`)}
                        star={row.line === 'fwd' && i === 1}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <span className="text-[0.65rem] uppercase tracking-wider text-mist-500">
                {t('bench')}
              </span>
              {[0, 1, 2].map((i) => (
                <span key={i} className="glass h-7 w-7 rounded-full ring-1 ring-mist-500/15" />
              ))}
            </div>
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
