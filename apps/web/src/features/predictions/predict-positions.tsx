'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Flag } from '@/components/ui/flag';
import { AnalystMark } from '@/features/copilot/analyst-mark';
import { cn } from '@/lib/utils';
import { teamNameForCode } from '@/lib/football/teams';
import { coinsForPoints } from '@/lib/scoring';
import { makePrediction, type PredictionErrorKey } from './actions';
import { stanceOf } from './card-model';
import { PositionTicket } from './position-ticket';
import type { PredictableFixture } from './queries';
import type { Outcome } from './validation';

const OUTCOMES: Outcome[] = ['home', 'draw', 'away'];

// setTimeout caps at ~24.8 days (2^31-1 ms); past that we don't schedule the lock
// flip (a fixture that far out is re-evaluated on a later mount anyway).
const MAX_TIMEOUT_MS = 2_147_483_647;

/**
 * The interactive island for a predict card. Owns the 1X2 selection with OPTIMISTIC
 * UI: a tap flips straight to the position ticket (with an in-flight "confirming"
 * state) while the Server Action (`makePrediction`) runs; on success the pick is
 * confirmed, on failure it rolls back to the picker with a localized error.
 *
 * Lock-at-kickoff is REACTIVE: the lock is seeded at render and flips exactly at
 * kickoff if the tab is open across it, so the card closes itself instead of letting
 * a tap bounce off a server rejection. "Change my read" keeps the prior position
 * visible (it's still saved server-side) rather than looking like an erase.
 *
 * D-037: probability and position, never odds or a wager.
 */
export function PredictPositions({ fixture }: { fixture: PredictableFixture }) {
  const t = useTranslations('predictions');

  // Confirmed pick (server truth). Seeded from the fixture's existing userPick.
  const [pick, setPick] = useState<Outcome | null>(fixture.userPick);
  // The outcome just tapped — shown as the ticket while the action runs (or null).
  const [optimisticPick, setOptimisticPick] = useState<Outcome | null>(null);
  // While replacing a pick: the prior (still server-saved) outcome, so the picker
  // can say "your current position: X" instead of looking like an erase (P3).
  const [changingFrom, setChangingFrom] = useState<Outcome | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<PredictionErrorKey | null>(null);

  // Reactive kickoff lock (P2).
  const [locked, setLocked] = useState(() => new Date(fixture.kickoffISO).getTime() <= Date.now());
  useEffect(() => {
    if (locked) return;
    const ms = new Date(fixture.kickoffISO).getTime() - Date.now();
    if (ms > MAX_TIMEOUT_MS) return;
    // Flip through the timer callback (never a synchronous setState in the effect
    // body): a kickoff already in the past schedules at 0ms → fires on the next tick.
    const id = setTimeout(() => setLocked(true), Math.max(0, ms));
    return () => clearTimeout(id);
  }, [locked, fixture.kickoffISO]);

  function choose(outcome: Outcome) {
    if (locked || isPending) return;
    setError(null);
    setOptimisticPick(outcome);
    startTransition(async () => {
      const result = await makePrediction(fixture.id, outcome);
      if (result.ok) {
        setPick(result.pick);
        setChangingFrom(null);
        setOptimisticPick(null);
      } else {
        setOptimisticPick(null);
        setError(result.error);
        if (result.error === 'locked') setLocked(true);
      }
    });
  }

  function startChange() {
    if (isPending) return;
    setError(null);
    setChangingFrom(pick);
    setPick(null);
  }

  function cancelChange() {
    setError(null);
    setPick(changingFrom);
    setChangingFrom(null);
  }

  // 1. A tap is in flight → the ticket, in its "confirming" state.
  if (optimisticPick) {
    return <PositionTicket fixture={fixture} pick={optimisticPick} locked={locked} pending />;
  }

  // The server-saved value, accounting for an in-progress change (the old pick is
  // still saved until a new one is confirmed).
  const savedPick = pick ?? changingFrom;

  // 2. Kickoff passed → no more changes: locked ticket if there's a saved pick,
  //    else the closed-market hero (P4 — never a picker that can't be used).
  if (locked) {
    return savedPick ? (
      <PositionTicket fixture={fixture} pick={savedPick} locked />
    ) : (
      <LockedHero label={t('lockedClosed')} />
    );
  }

  // 4. A confirmed pick, steady → the ticket with the change-pick control.
  if (pick && changingFrom == null) {
    return (
      <PositionTicket
        fixture={fixture}
        pick={pick}
        locked={locked}
        changeControl={
          <button
            type="button"
            onClick={startChange}
            disabled={isPending}
            className="rounded font-display text-mist-400 transition-colors hover:text-mist-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400 disabled:opacity-50"
          >
            {t('ticket.changePick')} ›
          </button>
        }
      />
    );
  }

  // 3 + 5. The picker (fresh, or replacing a saved pick with the changing banner).
  return (
    <div>
      {changingFrom != null ? (
        <div className="mb-2.5 flex items-center gap-3 rounded-[12px] border border-led-400/20 bg-led-500/[0.08] px-3 py-2 text-[0.74rem] text-mist-200">
          <span className="min-w-0 flex-1">
            {t('changing.banner', { team: outcomeLabel(fixture, changingFrom, t) })}
          </span>
          <button
            type="button"
            onClick={cancelChange}
            className="shrink-0 rounded font-display font-semibold text-led-300 transition-colors hover:text-led-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400"
          >
            {t('changing.cancel')}
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-2" role="group" aria-label={t('marketEyebrow')}>
        {OUTCOMES.map((outcome) => (
          <OutcomeButton
            key={outcome}
            fixture={fixture}
            outcome={outcome}
            disabled={isPending}
            current={changingFrom === outcome}
            onSelect={() => choose(outcome)}
          />
        ))}
      </div>

      {/* the difficulty↔reward rule, made explicit — every pick is a stance, not a number */}
      <p className="mt-2.5 text-[0.7rem] text-mist-400">{t('rewardRule')}</p>

      {/* error (rolled-back state) */}
      {error ? (
        <p role="alert" className="mt-3 text-[0.74rem] font-medium text-flare-400">
          {t(`error.${error}`)}
        </p>
      ) : null}

      {/* analyst lean line */}
      <div className="mt-3.5 flex items-center gap-2.5 text-[0.74rem] text-mist-300">
        <AnalystMark size="xs" live={false} />
        <span>
          {fixture.lean === 'draw'
            ? t('analystLeansDraw')
            : t('analystLeans', { team: leanTeamLabel(fixture) })}
        </span>
      </div>

      {/* honest "be one of the first" hint — no invented community data */}
      <div className="mt-3 flex items-center gap-2 text-[0.72rem] text-mist-400">
        <span
          aria-hidden
          className="h-[5px] w-[5px] rounded-full bg-volt-400 shadow-[0_0_8px_var(--color-volt-400)]"
        />
        {t('firstHint')}
      </div>
    </div>
  );
}

/** Closed-market state: kickoff passed and the user never took a position. */
function LockedHero({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[14px] border border-mist-500/15 bg-night-850/55 px-4 py-4 text-[0.82rem] text-mist-300">
      <LockIcon />
      <span>{label}</span>
    </div>
  );
}

/** One tappable priced outcome: flag + label + El Analista/Contrario tag + points + prob%. */
function OutcomeButton({
  fixture,
  outcome,
  disabled,
  current = false,
  onSelect,
}: {
  fixture: PredictableFixture;
  outcome: Outcome;
  disabled: boolean;
  /** This outcome is the user's currently-saved pick (highlighted while changing). */
  current?: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations('predictions');
  const isLean = fixture.lean === outcome;
  const stance = stanceOf(outcome, fixture.lean);
  const pct = Math.round(fixture.prob[outcome] * 100);
  const points = fixture.points[outcome];
  const coins = coinsForPoints(points);

  const code = outcome === 'home' ? fixture.homeCode : outcome === 'away' ? fixture.awayCode : null;
  const label =
    outcome === 'draw'
      ? t('draw')
      : t('outcomeWin', {
          team:
            teamNameForCode(outcome === 'home' ? fixture.homeCode : fixture.awayCode) ??
            (outcome === 'home' ? fixture.homeCode : fixture.awayCode),
        });

  const ariaLabel = `${label} — ${pct}% — ${t('pointsIfRightLong', { points })} — ${t('coinsIfRight', { coins })}${
    current ? ` — ${t('changing.current')}` : ''
  }`;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'relative flex min-h-11 items-center gap-3 overflow-hidden rounded-[14px] border px-3.5 py-3 text-left transition-all duration-200',
        'border-mist-200/[0.09] bg-night-850/55',
        'hover:-translate-y-px hover:border-led-400/35',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        current && 'border-led-400/45 ring-1 ring-led-400/40',
      )}
    >
      {/* the model's read, drawn as a faint fill behind the row (the "market depth") */}
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 bg-led-500/[0.09]"
        style={{ width: `${pct}%` }}
      />

      {code ? (
        <Flag code={code} size="sm" className="relative" />
      ) : (
        <span className="nums relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-night-700 font-display text-[0.6rem] font-bold text-mist-400 ring-1 ring-mist-200/15">
          X
        </span>
      )}

      <span
        className={cn(
          'relative min-w-0 flex-1 truncate text-[0.94rem]',
          isLean ? 'font-semibold text-mist-50' : 'text-mist-200',
        )}
      >
        {label}
      </span>

      {current ? (
        <span className="relative shrink-0 rounded-pill bg-led-500/[0.18] px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide text-led-300">
          {t('changing.currentTag')}
        </span>
      ) : (
        <span
          className={cn(
            'relative shrink-0 rounded-pill px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide',
            stance === 'consensus' ? 'bg-led-500/[0.18] text-led-300' : 'bg-gold-400/[0.14] text-gold-300',
          )}
        >
          {stance === 'consensus' ? t('tagLean') : t('tagContrarian')}
        </span>
      )}

      {/* dual reward — what you EARN on a correct call: points (rank) + Tokens (wallet).
          Two currencies, shown before you commit, so the value of the call is concrete. */}
      <span className="relative flex shrink-0 flex-col items-end leading-tight">
        <span className="nums font-display text-[0.78rem] font-bold text-pitch-300">
          {t('pointsIfRight', { points })}
        </span>
        <span className="nums font-display text-[0.62rem] font-bold text-lime-300">
          {t('coinsIfRight', { coins })}
        </span>
      </span>

      <span className="nums relative w-[46px] shrink-0 text-right font-display text-[1.04rem] font-extrabold text-mist-50">
        {pct}%
      </span>
    </button>
  );
}

/** Localized label for any outcome (team name, or "draw"). */
function outcomeLabel(
  fixture: PredictableFixture,
  outcome: Outcome,
  t: ReturnType<typeof useTranslations<'predictions'>>,
): string {
  if (outcome === 'draw') return t('draw');
  const code = outcome === 'home' ? fixture.homeCode : fixture.awayCode;
  return t('outcomeWin', { team: teamNameForCode(code) ?? code });
}

/** Localized team name for the Analyst-lean line (only called for home/away leans). */
function leanTeamLabel(fixture: PredictableFixture): string {
  const code = fixture.lean === 'home' ? fixture.homeCode : fixture.awayCode;
  return teamNameForCode(code) ?? code;
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-gold-300">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
