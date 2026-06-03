'use client';

import { motion } from 'framer-motion';
import { useFormatter, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LiveDot } from '@/components/ui/live-dot';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { HomeMatch, TeamLite } from '@/lib/football/types';

function TeamToken({ team }: { team: TeamLite }) {
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-[0.7rem] font-bold text-night-950"
      style={{ background: `linear-gradient(140deg, ${team.accent}, ${team.accent}99)` }}
    >
      {team.code}
    </span>
  );
}

function TeamRow({ team, pct }: { team: TeamLite; pct: number }) {
  return (
    <div className="flex items-center gap-3">
      <TeamToken team={team} />
      <div className="flex min-w-0 flex-col">
        <span className="font-display text-sm font-bold leading-none text-mist-50">{team.code}</span>
        <span className="truncate text-xs text-mist-400">{team.name}</span>
      </div>
      <span className="nums ml-auto font-display text-lg font-extrabold text-mist-100">{pct}%</span>
    </div>
  );
}

interface MatchCardProps {
  match: HomeMatch;
  featured?: boolean;
  className?: string;
}

/** Premium broadcast match card: real matchup, model probabilities, predict CTA. */
export function MatchCard({ match, featured = false, className }: MatchCardProps) {
  const t = useTranslations('matches');
  const tCommon = useTranslations('common');
  const format = useFormatter();
  const { home, away, prob } = match;
  const pct = (x: number) => Math.round(x * 100);

  const dateLabel = match.dateISO
    ? format.dateTime(new Date(`${match.dateISO}T12:00:00Z`), { day: 'numeric', month: 'short' })
    : null;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={cn('group h-full', featured && 'animate-float', className)}
    >
      <Card
        className={cn(
          'flex h-full flex-col gap-4 p-5 transition-all duration-300',
          featured
            ? 'glow-led'
            : 'group-hover:border-led-400/40 group-hover:shadow-[0_24px_70px_-34px_rgba(61,116,255,0.55)]',
        )}
      >
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

        {/* teams */}
        <div className="flex flex-col gap-3">
          <TeamRow team={home} pct={pct(prob.home)} />
          <div className="flex items-center justify-center">
            <span className="rounded-pill bg-night-900/70 px-3 py-0.5 text-[0.7rem] text-mist-400">
              {t('draw')} · <span className="nums">{pct(prob.draw)}%</span>
            </span>
          </div>
          <TeamRow team={away} pct={pct(prob.away)} />
        </div>

        {/* probability bar */}
        <div
          className="flex h-2 overflow-hidden rounded-pill bg-night-900"
          role="img"
          aria-label={`${home.code} ${pct(prob.home)}% · ${t('draw')} ${pct(prob.draw)}% · ${away.code} ${pct(prob.away)}%`}
        >
          <span className="h-full bg-led-500" style={{ width: `${pct(prob.home)}%` }} />
          <span className="h-full bg-mist-500/40" style={{ width: `${pct(prob.draw)}%` }} />
          <span className="h-full bg-volt-400" style={{ width: `${pct(prob.away)}%` }} />
        </div>

        {/* predict CTA */}
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: featured ? 'primary' : 'secondary', size: 'sm' }),
            'mt-auto w-full',
          )}
        >
          {t('predict')}
        </button>
      </Card>
    </motion.div>
  );
}
