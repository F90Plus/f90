import type { ReactNode } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Flag } from '@/components/ui/flag';
import { AnalystMark } from '@/features/copilot/analyst-mark';
import { cn } from '@/lib/utils';
import { teamNameForCode } from '@/lib/football/teams';
import { ticketView } from './card-model';
import type { PredictableFixture } from './queries';
import type { Outcome } from './validation';

/** Settlement facts for a resolved prediction (P2-8/P2-9 reuse this ticket). */
export interface TicketSettlement {
  correct: boolean;
  awardedPoints: number;
  homeGoals: number;
  awayGoals: number;
}

/**
 * The post-pick POSITION TICKET — the elevation after you take a side. Pure,
 * server-safe presentation (no client hooks): rendered on server load when a
 * `userPick` exists AND by the client island after an optimistic pick.
 *
 * States:
 *  - pending  → the live position (reward + market read + "TÚ" marker + lock).
 *  - settled  → won (pitch-green) or lost, with the final score.
 *
 * Consensus vs contrarian is "you vs El Analista": contrarian is the higher-reward,
 * gold-accented side. Probability/position only — never odds or a wager (D-037).
 */
export function PositionTicket({
  fixture,
  pick,
  locked = false,
  pending = false,
  settlement,
  changeControl,
  className,
}: {
  fixture: PredictableFixture;
  pick: Outcome;
  /** Kickoff has passed — the pick is locked (no change affordance). */
  locked?: boolean;
  /** The optimistic pick is being confirmed by the server (in-flight feedback). */
  pending?: boolean;
  /** When present, renders the settled (won/lost) variant. */
  settlement?: TicketSettlement;
  /** Interactive "change my read" control injected by the client island. */
  changeControl?: ReactNode;
  className?: string;
}) {
  const t = useTranslations('predictions');
  const f = useFormatter();
  const view = ticketView(fixture, pick);
  const isContrarian = view.stance === 'contrarian';
  const isSettled = settlement != null;
  const isWon = settlement?.correct ?? false;

  const pct = (x: number) => Math.round(x * 100);
  const pctHome = pct(fixture.prob.home);
  const pctDraw = pct(fixture.prob.draw);
  const pctAway = pct(fixture.prob.away);
  const pickCode = pick === 'home' ? fixture.homeCode : pick === 'away' ? fixture.awayCode : null;
  const pickPct = pick === 'home' ? pctHome : pick === 'away' ? pctAway : pctDraw;

  // Localized team name for the headline ("{team} gana"); fall back to the code.
  const teamLabel = (code: string) => teamNameForCode(code) ?? code;
  const headline =
    pick === 'draw'
      ? t('draw')
      : t('outcomeWin', { team: teamLabel(pick === 'home' ? fixture.homeCode : fixture.awayCode) });

  return (
    <Card
      aria-busy={pending || undefined}
      className={cn(
        'overflow-hidden transition-opacity',
        isSettled ? (isWon ? 'glow-pitch' : '') : 'glow-led',
        pending && 'opacity-95',
        className,
      )}
    >
      {/* HEAD — pick headline + identity badge */}
      <div
        className={cn(
          'border-b px-5 pb-4 pt-[18px]',
          isSettled
            ? isWon
              ? 'border-pitch-500/25 bg-gradient-to-br from-pitch-500/18 to-transparent'
              : 'border-mist-500/15 bg-gradient-to-br from-night-700/40 to-transparent'
            : 'border-led-400/20 bg-gradient-to-br from-led-500/20 to-transparent',
        )}
      >
        {/* ticket label */}
        <div
          className={cn(
            'mb-2.5 flex items-center gap-2 font-display text-[0.62rem] font-bold uppercase tracking-[0.18em]',
            isSettled ? (isWon ? 'text-pitch-300' : 'text-mist-400') : 'text-led-300',
          )}
        >
          {!isSettled ? <AnalystMark size="xs" live className="h-[18px] w-[18px]" /> : null}
          <span>{isSettled ? (isWon ? t('settled.wonLabel') : t('settled.lostLabel')) : t('ticket.label')}</span>
          {isSettled ? (
            <span className="nums ml-auto font-display font-extrabold text-pitch-300">
              {settlement.homeGoals} – {settlement.awayGoals}
            </span>
          ) : null}
        </div>

        {/* pick row: flag + headline + identity badge */}
        <div className="flex items-center gap-3">
          {pickCode ? (
            <Flag code={pickCode} size="lg" />
          ) : (
            <span className="nums flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-night-700 font-display text-[0.78rem] font-bold text-mist-400 ring-1 ring-mist-200/15">
              X
            </span>
          )}
          <div className="min-w-0">
            <div className="truncate font-display text-[1.35rem] font-extrabold leading-tight text-white">
              {headline}
            </div>
            <div className="mt-0.5 truncate text-[0.74rem] text-mist-300">
              {isSettled ? (
                <>
                  {isContrarian ? t('ticket.stanceContrarian') : t('ticket.stanceConsensus')}
                  {fixture.groupLabel ? <> · {fixture.groupLabel}</> : null}
                </>
              ) : (
                <>
                  {teamLabel(fixture.homeCode)} {t('vs')} {teamLabel(fixture.awayCode)}
                  {fixture.groupLabel ? <> · {fixture.groupLabel}</> : null} ·{' '}
                  <span className="nums">
                    {f.dateTime(new Date(fixture.kickoffISO), {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* identity badge */}
          <div className="ml-auto shrink-0">
            {isSettled ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1.5 font-display text-[0.72rem] font-bold',
                  isWon
                    ? 'border-pitch-500/30 bg-pitch-500/16 text-pitch-300'
                    : 'border-mist-500/25 bg-night-800/60 text-mist-300',
                )}
              >
                {isWon ? (
                  <span className="nums">✓ {t('settled.wonBadge', { points: settlement.awardedPoints })}</span>
                ) : (
                  t('settled.lostBadge')
                )}
              </span>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1.5 font-display text-[0.72rem] font-bold',
                  isContrarian
                    ? 'border-gold-400/32 bg-gold-400/16 text-gold-300'
                    : 'border-led-400/30 bg-led-500/16 text-led-300',
                )}
              >
                {isContrarian ? '⚡ ' : ''}
                {isContrarian ? t('ticket.stanceContrarian') : t('ticket.stanceConsensus')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BODY — only for the live (pending) ticket */}
      {!isSettled ? (
        <div className="px-5 pb-5 pt-4">
          {/* reward */}
          <div className="flex items-center gap-3.5 rounded-[14px] border border-pitch-500/22 bg-pitch-500/[0.08] px-4 py-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.6rem] uppercase tracking-[0.13em] text-mist-400">
                {t('ticket.rewardIfRight')}
              </span>
              <span className="nums font-display text-[1.4rem] font-extrabold text-pitch-300">
                {t('ticket.rewardPoints', { points: view.points })}
              </span>
            </div>
            <span className="self-stretch w-px bg-pitch-500/22" aria-hidden />
            <div className="flex flex-col gap-0.5">
              <span className="text-[0.6rem] uppercase tracking-[0.13em] text-mist-400">
                {t('ticket.rewardCoins')}
              </span>
              {/* Tokens in the currency's lime — distinct from points (pitch), so the
                  wallet reward reads as its own thing within the flow (P-D). */}
              <span className="nums font-display text-[1.4rem] font-extrabold text-lime-300">
                {t('ticket.rewardCoinsValue', { coins: view.coins })}
              </span>
            </div>
            <span className="ml-auto max-w-[130px] text-right text-[0.7rem] text-mist-400">
              {isContrarian
                ? t('ticket.noteContrarian', { pct: pickPct })
                : t('ticket.noteConsensus', { pct: pickPct })}
            </span>
          </div>

          {/* what's at stake — this position is on your permanent record + ranking (P-B) */}
          <p className="mt-2.5 text-[0.7rem] text-mist-400">{t('ticket.countsToward')}</p>

          {/* market read + "TÚ" marker */}
          <div className="mt-3.5">
            <div className="mb-[7px] flex justify-between text-[0.68rem] text-mist-400">
              <span>{t('ticket.marketRead')}</span>
              <span className="nums">
                {fixture.homeCode} {t('ticket.readSummary', { home: pctHome, draw: pctDraw, away: pctAway })}
              </span>
            </div>
            <div
              className="relative flex h-2 rounded-pill bg-night-900"
              role="img"
              aria-label={`${fixture.homeCode} ${pctHome}% · ${t('draw')} ${pctDraw}% · ${fixture.awayCode} ${pctAway}%`}
            >
              <span className="h-full rounded-l-pill bg-led-500" style={{ width: `${pctHome}%` }} />
              <span className="h-full bg-mist-500/45" style={{ width: `${pctDraw}%` }} />
              <span className="h-full rounded-r-pill bg-volt-400" style={{ width: `${pctAway}%` }} />
              <span
                className="absolute -top-[5px] h-[18px] w-[3px] -translate-x-1/2 rounded-sm bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                style={{ left: `${view.readMarkerPct}%` }}
                aria-hidden
              >
                <span className="absolute -top-[15px] left-1/2 -translate-x-1/2 font-display text-[0.52rem] font-extrabold tracking-[0.08em] text-mist-100">
                  {t('ticket.youMarker')}
                </span>
              </span>
            </div>
          </div>

          {/* foot — lock state + (confirming | change affordance) */}
          <div className="mt-3.5 flex items-center gap-2.5 text-[0.74rem] text-mist-300">
            <span className="inline-flex items-center gap-1.5 text-gold-300">
              <LockIcon />
              {t('ticket.locksAtKickoff')}
            </span>
            {pending ? (
              <span className="ml-auto inline-flex items-center gap-1.5 text-led-300" aria-live="polite">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-led-400 motion-safe:animate-pulse"
                />
                {t('ticket.confirming')}
              </span>
            ) : !locked ? (
              <span className="ml-auto">{changeControl}</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
