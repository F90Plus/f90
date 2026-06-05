'use client';

import { motion } from 'framer-motion';
import { useFormatter, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiveDot } from '@/components/ui/live-dot';
import { AnalystMark } from '@/features/copilot/analyst-mark';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { PLAY_HREF } from '@/lib/constants';
import type { HomeMatch, TeamLite } from '@/lib/football/types';

function TeamToken({ team }: { team: TeamLite }) {
  return (
    <span
      className="nums flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-display text-[0.6rem] font-bold text-night-950"
      style={{ background: `linear-gradient(140deg, ${team.accent}, ${team.accent}99)` }}
    >
      {team.code}
    </span>
  );
}

/** One priced outcome in the 1X2 market — the leaned side is lit. */
function OutcomeRow({
  token,
  label,
  pct,
  leaned,
}: {
  token: React.ReactNode;
  label: string;
  pct: number;
  leaned: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors',
        leaned ? 'bg-led-500/10 ring-1 ring-led-400/25' : 'hover:bg-night-800/40',
      )}
    >
      {token}
      <span className={cn('min-w-0 flex-1 truncate text-sm', leaned ? 'font-semibold text-mist-50' : 'text-mist-200')}>
        {label}
      </span>
      <span className="nums font-display text-sm font-bold text-mist-50">{pct}%</span>
    </div>
  );
}

/**
 * A fixture as a live 1X2 market: each outcome is a price, the Analyst's lean is
 * lit, the crowd is shown, and a single "take a position" CTA turns it into action
 * (per the validated model — chips for single-outcome markets, one CTA for 1X2).
 * Probability %, never odds (D-037); allocation is conviction, not a wager.
 */
export function MatchCard({ match, className }: { match: HomeMatch; className?: string }) {
  const t = useTranslations('matches');
  const tm = useTranslations('markets');
  const tCommon = useTranslations('common');
  const format = useFormatter();
  const { home, away, prob } = match;
  const pct = (x: number) => Math.round(x * 100);

  const dateLabel = match.dateISO
    ? format.dateTime(new Date(`${match.dateISO}T12:00:00Z`), { day: 'numeric', month: 'short' })
    : null;

  // The Analyst's lean = the most probable outcome; light it and name it.
  const outcomes = [
    { key: 'home', value: prob.home, pick: home.code },
    { key: 'draw', value: prob.draw, pick: t('draw') },
    { key: 'away', value: prob.away, pick: away.code },
  ] as const;
  const lean = outcomes.reduce((a, b) => (b.value > a.value ? b : a));
  const topPct = pct(lean.value);
  const participants = Math.round(2000 + topPct * 60);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      whileHover={{ y: -4 }}
      className={cn('group h-full', className)}
    >
      <Card className="flex h-full flex-col gap-3 p-5 transition-all duration-300 group-hover:border-led-400/40 group-hover:shadow-[0_24px_70px_-34px_rgba(61,116,255,0.55)]">
        {/* status row */}
        <div className="flex items-center justify-between text-xs">
          <Badge tone="neutral">{t('group', { group: match.group })}</Badge>
          {match.status === 'live' ? (
            <span className="flex items-center gap-1.5 font-semibold text-flare-400">
              <LiveDot /> {tCommon('live')}
            </span>
          ) : (
            <span className="text-mist-400">
              {dateLabel ? <span className="text-mist-300">{dateLabel}</span> : null}
              {dateLabel && match.timeLabel ? ' · ' : ''}
              {match.timeLabel ? <span className="nums">{match.timeLabel}</span> : null}
            </span>
          )}
        </div>

        {/* the three priced outcomes */}
        <div className="flex flex-col gap-1">
          <OutcomeRow token={<TeamToken team={home} />} label={home.name} pct={pct(prob.home)} leaned={lean.key === 'home'} />
          <OutcomeRow
            token={
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-night-800 font-display text-[0.6rem] font-bold text-mist-400">
                X
              </span>
            }
            label={t('draw')}
            pct={pct(prob.draw)}
            leaned={lean.key === 'draw'}
          />
          <OutcomeRow token={<TeamToken team={away} />} label={away.name} pct={pct(prob.away)} leaned={lean.key === 'away'} />
        </div>

        {/* probability bar */}
        <div
          className="flex h-1.5 overflow-hidden rounded-pill bg-night-900"
          role="img"
          aria-label={`${home.code} ${pct(prob.home)}% · ${t('draw')} ${pct(prob.draw)}% · ${away.code} ${pct(prob.away)}%`}
        >
          <span className="h-full bg-led-500" style={{ width: `${pct(prob.home)}%` }} />
          <span className="h-full bg-mist-500/40" style={{ width: `${pct(prob.draw)}%` }} />
          <span className="h-full bg-volt-400" style={{ width: `${pct(prob.away)}%` }} />
        </div>

        {/* Analyst lean + crowd */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.72rem]">
          <span className="flex items-center gap-1.5 text-mist-300">
            <AnalystMark size="xs" live={false} />
            {tm('lean', { pick: lean.pick })}
          </span>
          <span className="text-mist-500">
            · <span className="nums font-semibold text-mist-400">{format.number(participants)}</span>{' '}
            {tm('participants')}
          </span>
        </div>

        {/* direct action — take a position (1X2) */}
        <div className="mt-auto flex items-center gap-3 pt-0.5">
          <a href={PLAY_HREF} className={cn(buttonVariants({ size: 'md' }), 'flex-1')}>
            {tm('position.cta')}
          </a>
          <span className="shrink-0 text-[0.7rem] text-mist-500">{tm('position.from')}</span>
        </div>
      </Card>
    </motion.div>
  );
}
