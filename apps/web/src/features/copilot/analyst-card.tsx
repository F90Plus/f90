'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fadeUp, viewportOnce } from '@/lib/motion';
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

  const p = insight.probabilities;
  const pct = (x: number) => Math.round(x * 100);
  const rec = recommendationLine(insight);
  const conf = confidenceLine(insight);
  const drivers = driverLines(insight);
  const value = valueLine(insight);

  return (
    <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={viewportOnce}>
      <Card className="glow-led flex flex-col gap-5 p-6">
        {/* header */}
        <div className="flex items-center justify-between gap-3">
          <Badge tone="led" className="gap-2">
            <span className="animate-live-pulse h-1.5 w-1.5 rounded-full bg-led-400" />
            {t('name')}
          </Badge>
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

        <p className="text-[0.7rem] leading-relaxed text-mist-500">{t('disclaimer')}</p>
      </Card>
    </motion.div>
  );
}
