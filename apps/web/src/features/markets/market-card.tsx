'use client';

import { motion } from 'framer-motion';
import { useFormatter, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { PLAY_HREF } from '@/lib/constants';
import { AnalystMark } from '@/features/copilot/analyst-mark';
import { marketDirection, type Market } from '@/data/markets';
import { Sparkline } from './sparkline';

const STAKES = [10, 50, 100] as const;

/** A 3-letter market symbol from the subject — accent-free, ticker-like.
 *  NFD splits accented letters into base + combining mark; keeping only A–Z
 *  drops the marks, spaces and punctuation in one pass ("España" → "ESP"). */
function symbolOf(subject: string): string {
  return subject.normalize('NFD').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
}

function DeltaChip({ up, delta }: { up: boolean; delta: number }) {
  return (
    <span
      className={cn(
        'nums inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-bold tabular-nums',
        up ? 'bg-pitch-500/10 text-pitch-300' : 'bg-flare-500/10 text-flare-400',
      )}
    >
      {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

/** Three overlapping accent dots — a glanceable "crowd" / collective-intelligence cue. */
function CrowdDots({ accent }: { accent: string }) {
  return (
    <span className="flex items-center" aria-hidden>
      {[0.95, 0.6, 0.3].map((o, i) => (
        <span
          key={i}
          className={cn('h-3 w-3 rounded-full ring-1 ring-night-900', i > 0 && '-ml-1.5')}
          style={{ background: accent, opacity: o }}
        />
      ))}
    </span>
  );
}

/**
 * Quick-conviction allocation — the "direct action" that turns a stat into a
 * position you take. Allocating F90 is conviction/exposure, never a wager (D-037);
 * until the engine lands (Phase 2/3) each chip is an honest preview that routes to
 * sign-up ("to take a position, create your profile").
 */
export function PositionChips({ label, className }: { label: string; className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {STAKES.map((amt, i) => (
        <a
          key={amt}
          href={PLAY_HREF}
          aria-label={`${label} +${amt} F90`}
          className={cn(
            'nums flex-1 rounded-pill border py-2 text-center font-display text-sm font-bold transition-all duration-200 hover:-translate-y-0.5',
            i === STAKES.length - 1
              ? 'border-led-500 bg-led-500 text-white hover:bg-led-400'
              : 'border-led-400/25 bg-led-500/10 text-mist-50 hover:border-led-400/55 hover:bg-led-500/20',
          )}
        >
          +{amt}
          {i === STAKES.length - 1 ? <span className="ml-0.5 text-[0.7rem] font-semibold">F90</span> : null}
        </a>
      ))}
    </div>
  );
}

/**
 * A single prediction market, read like a live market you can take a position in:
 * the probability is the protagonist, a sparkline shows the move, the Analyst's
 * conviction sits on the card ("+X% sobre el consenso"), the crowd carries the
 * collective intelligence, and a quick-allocation row turns it into action.
 * Probability %, never odds (D-037); allocation is conviction, never a wager.
 */
export function MarketCard({ market }: { market: Market }) {
  const t = useTranslations('markets');
  const f = useFormatter();
  const up = marketDirection(market.delta) === 'up';
  const hasConviction = typeof market.edge === 'number' && market.edge > 0;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="group h-full"
    >
      <Card
        className={cn(
          'flex h-full flex-col gap-3.5 p-5 transition-all duration-300',
          market.featured
            ? 'glow-gold ring-1 ring-gold-400/25'
            : 'group-hover:-translate-y-1 group-hover:border-led-400/40 group-hover:shadow-[0_24px_70px_-34px_rgba(61,116,255,0.55)]',
        )}
      >
        {/* header: symbol token · subject + outcome · 24h move */}
        <div className="flex items-center gap-3">
          <span
            className="nums flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[0.62rem] font-extrabold tracking-tight text-night-950"
            style={{ background: `linear-gradient(140deg, ${market.accent}, ${market.accent}99)` }}
          >
            {symbolOf(market.subject)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-bold leading-tight text-mist-50">
              {market.subject}
            </p>
            <p className="truncate text-xs text-mist-400">
              {t(`q.${market.q}`, { group: market.param ?? '' })}
            </p>
          </div>
          {market.featured ? (
            <span className="rounded-pill border border-gold-400/40 bg-gold-400/10 px-2 py-0.5 text-[0.58rem] font-semibold uppercase tracking-wide text-gold-300">
              {t('opportunity')}
            </span>
          ) : (
            <DeltaChip up={up} delta={market.delta} />
          )}
        </div>

        {/* probability protagonist + trend */}
        <div className="flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-0.5">
            <span className="nums font-display text-[2.5rem] font-extrabold leading-none text-mist-50">
              {market.chance}
            </span>
            <span className="font-display text-xl font-bold text-mist-400">%</span>
          </div>
          <Sparkline values={market.spark} up={up} className="h-9 w-24" />
        </div>

        {/* probability bar */}
        <div
          className="h-1.5 overflow-hidden rounded-pill bg-night-900"
          role="img"
          aria-label={`${market.chance}%`}
        >
          <span
            className="block h-full rounded-pill bg-gradient-to-r from-led-500 to-volt-400"
            style={{ width: `${market.chance}%` }}
          />
        </div>

        {/* the Analyst's conviction on this market */}
        {hasConviction ? (
          <div className="flex items-center gap-2">
            <AnalystMark size="xs" live={false} />
            <span className="text-xs font-semibold text-gold-300">
              {t('consensus', { edge: market.edge ?? 0 })}
            </span>
          </div>
        ) : null}

        {/* collective intelligence */}
        <div className="flex items-center gap-2 text-[0.72rem] text-mist-500">
          <CrowdDots accent={market.accent} />
          <span>
            <span className="nums font-semibold text-mist-300">{f.number(market.predictors)}</span>{' '}
            {t('participants')}
          </span>
        </div>

        {/* direct action — allocate conviction */}
        <PositionChips label={t('position.label')} className="mt-auto pt-0.5" />
      </Card>
    </motion.div>
  );
}
