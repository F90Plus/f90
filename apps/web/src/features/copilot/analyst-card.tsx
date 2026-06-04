'use client';

import { motion } from 'framer-motion';
import { useFormatter, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalystMark } from './analyst-mark';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { PLAY_HREF } from '@/lib/constants';
import {
  confidenceLine,
  driverLines,
  recommendationLine,
  valueLine,
  type MatchInsight,
} from '@/lib/copilot';

const BUCKET_TONE = {
  high: 'free',
  solid: 'led',
  moderate: 'gold',
  low: 'neutral',
} as const;

/** The Analyst's read on one fixture — lean, confidence, probabilities, rationale. */
export function AnalystCard({ insight }: { insight: MatchInsight }) {
  const t = useTranslations('copilot');
  const tm = useTranslations('matches');
  const tk = useTranslations('markets');
  const f = useFormatter();

  const p = insight.probabilities;
  const pct = (x: number) => Math.round(x * 100);
  const rec = recommendationLine(insight);
  const conf = confidenceLine(insight);
  const drivers = driverLines(insight);
  const value = valueLine(insight);

  // Illustrative live participation — the marquee market carries the biggest crowd.
  const topPct = pct(Math.max(p.home, p.draw, p.away));
  const participants = Math.round(4200 + topPct * 55);
  const today = Math.round(participants * 0.07);

  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
      <Card className="glow-led flex flex-col gap-5 p-6">
        {/* header — the Analyst's identity, woven in */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AnalystMark size="sm" />
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-bold text-mist-50">{t('name')}</span>
              <span className="text-[0.7rem] font-medium text-led-300/90">{t('status')}</span>
            </div>
          </div>
          <span className="font-display text-sm font-bold text-mist-100">
            {insight.home.code} <span className="text-mist-500">vs</span> {insight.away.code}
          </span>
        </div>

        {/* probabilities */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.7rem] uppercase tracking-widest text-mist-500">
            {t('probabilities')}
          </span>
          <div className="flex h-2.5 overflow-hidden rounded-pill bg-night-900">
            <span className="h-full bg-led-500" style={{ width: `${pct(p.home)}%` }} />
            <span className="h-full bg-mist-500/40" style={{ width: `${pct(p.draw)}%` }} />
            <span className="h-full bg-volt-400" style={{ width: `${pct(p.away)}%` }} />
          </div>
          <div className="nums flex justify-between text-xs">
            <span className="font-semibold text-led-300">
              {insight.home.code} {pct(p.home)}%
            </span>
            <span className="text-mist-400">
              {tm('draw')} {pct(p.draw)}%
            </span>
            <span className="font-semibold text-volt-300">
              {insight.away.code} {pct(p.away)}%
            </span>
          </div>
        </div>

        {/* recommendation */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-night-900/60 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-[0.7rem] uppercase tracking-widest text-mist-500">
              {t('recommendation')}
            </span>
            <span className="font-display text-lg font-extrabold text-mist-50">
              {t(rec.key, rec.params)}
            </span>
          </div>
          <Badge tone={BUCKET_TONE[insight.confidenceBucket]}>{t(conf.key)}</Badge>
        </div>

        {/* why */}
        <div className="flex flex-col gap-2">
          <span className="text-[0.7rem] uppercase tracking-widest text-mist-500">{t('why')}</span>
          <ul className="flex flex-col gap-1.5">
            {drivers.map((d, i) => (
              <li key={`${d.key}-${i}`} className="flex items-start gap-2 text-sm text-mist-200">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                <span>{t(d.key, d.params)}</span>
              </li>
            ))}
          </ul>
        </div>

        {value ? <p className="text-xs text-gold-300">{t(value.key, value.params)}</p> : null}

        {/* live participation + the direct action (this marquee tie is a 1X2 market) */}
        <div className="flex items-center gap-2 border-t border-mist-500/10 pt-4 text-xs text-mist-500">
          <span className="flex items-center" aria-hidden>
            {['var(--color-led-400)', 'var(--color-volt-400)', 'var(--color-lime-400)'].map((c, i) => (
              <span
                key={i}
                className={cn('h-3 w-3 rounded-full ring-1 ring-night-900', i > 0 && '-ml-1.5')}
                style={{ background: c }}
              />
            ))}
          </span>
          <span>
            <span className="nums font-semibold text-mist-300">{f.number(participants)}</span>{' '}
            {tk('participants')} ·{' '}
            <span className="nums text-pitch-300">
              +{f.number(today)} {tk('today')}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={PLAY_HREF}
            className="flex-1 rounded-pill bg-led-500 py-2.5 text-center font-display text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-led-400"
          >
            {tk('position.cta')}
          </a>
          <span className="shrink-0 text-[0.7rem] text-mist-500">{tk('position.from')}</span>
        </div>

        <p className="text-[0.7rem] leading-relaxed text-mist-500">{t('disclaimer')}</p>
      </Card>
    </motion.div>
  );
}
