'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { fadeUp, staggerParent, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

const STEPS = [1, 2, 3] as const;
const ACCENTS = ['text-led-300', 'text-pitch-300', 'text-gold-300'] as const;

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  return (
    <section id="how-it-works" className="relative scroll-mt-24 py-16 sm:py-24">
      <Container className="flex flex-col items-center gap-12">
        <SectionHeading
          align="center"
          eyebrow={t('eyebrow')}
          title={t('title')}
          subtitle={t('subtitle')}
        />

        <motion.div
          variants={staggerParent(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="grid w-full gap-5 md:grid-cols-3"
        >
          {STEPS.map((n, i) => (
            <motion.div key={n} variants={fadeUp}>
              <Card className="flex h-full flex-col gap-4 p-7">
                <span className={cn('nums font-display text-5xl font-extrabold', ACCENTS[i])}>
                  {String(n).padStart(2, '0')}
                </span>
                <h3 className="font-display text-xl font-bold text-mist-50">
                  {t(`step${n}Title`)}
                </h3>
                <p className="text-sm leading-relaxed text-mist-300">{t(`step${n}Body`)}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
