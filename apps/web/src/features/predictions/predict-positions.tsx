'use client';

import { useOptimistic, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Flag } from '@/components/ui/flag';
import { AnalystMark } from '@/features/copilot/analyst-mark';
import { cn } from '@/lib/utils';
import { teamNameForCode } from '@/lib/football/teams';
import { makePrediction, type PredictionErrorKey } from './actions';
import { stanceOf } from './card-model';
import { PositionTicket } from './position-ticket';
import type { PredictableFixture } from './queries';
import type { Outcome } from './validation';

const OUTCOMES: Outcome[] = ['home', 'draw', 'away'];

/**
 * The interactive island for a predict card. Owns the 1X2 selection with
 * OPTIMISTIC UI: a tap flips straight to the position ticket while the Server
 * Action (`makePrediction`) runs; on success the pick is confirmed, on failure
 * it rolls back and a localized error (keyed by `PredictionErrorKey`) is shown.
 * Disabled once kickoff has passed (positions lock at kickoff — D-037: probability
 * and position, never odds or a wager).
 */
export function PredictPositions({ fixture }: { fixture: PredictableFixture }) {
  const t = useTranslations('predictions');

  // Confirmed pick (server truth). Seeded from the fixture's existing userPick.
  const [pick, setPick] = useState<Outcome | null>(fixture.userPick);
  // Optimistic overlay — auto-reverts to `pick` when the transition settles.
  const [optimisticPick, setOptimisticPick] = useOptimistic(pick);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<PredictionErrorKey | null>(null);

  const locked = new Date(fixture.kickoffISO).getTime() <= Date.now();

  function choose(outcome: Outcome) {
    if (locked || isPending) return;
    setError(null);
    startTransition(async () => {
      // Optimistically show the ticket for the tapped outcome immediately.
      setOptimisticPick(outcome);
      const result = await makePrediction(fixture.id, outcome);
      if (result.ok) {
        setPick(result.pick); // confirm — survives the transition end
      } else {
        setError(result.error); // optimisticPick auto-reverts to `pick`
      }
    });
  }

  // Show the ticket whenever there's a pick to display (optimistic or confirmed).
  if (optimisticPick) {
    return (
      <PositionTicket
        fixture={fixture}
        pick={optimisticPick}
        locked={locked}
        changeControl={
          <button
            type="button"
            onClick={() => {
              if (isPending) return;
              setError(null);
              setPick(null);
            }}
            disabled={isPending}
            className="rounded font-display text-mist-400 transition-colors hover:text-mist-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400 disabled:opacity-50"
          >
            {t('ticket.changePick')} ›
          </button>
        }
      />
    );
  }

  // ── Market-entry: the three selectable outcomes ──────────────────────────
  return (
    <div>
      <div className="flex flex-col gap-2" role="group" aria-label={t('marketEyebrow')}>
        {OUTCOMES.map((outcome) => (
          <OutcomeButton
            key={outcome}
            fixture={fixture}
            outcome={outcome}
            disabled={locked || isPending}
            onSelect={() => choose(outcome)}
          />
        ))}
      </div>

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
      <div className="mt-3 flex items-center gap-2 text-[0.72rem] text-mist-500">
        <span
          aria-hidden
          className="h-[5px] w-[5px] rounded-full bg-volt-400 shadow-[0_0_8px_var(--color-volt-400)]"
        />
        {t('firstHint')}
      </div>
    </div>
  );
}

/** One tappable priced outcome: flag + label + El Analista/Contrario tag + points + prob%. */
function OutcomeButton({
  fixture,
  outcome,
  disabled,
  onSelect,
}: {
  fixture: PredictableFixture;
  outcome: Outcome;
  disabled: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations('predictions');
  const isLean = fixture.lean === outcome;
  const stance = stanceOf(outcome, fixture.lean);
  const pct = Math.round(fixture.prob[outcome] * 100);
  const points = fixture.points[outcome];

  const code = outcome === 'home' ? fixture.homeCode : outcome === 'away' ? fixture.awayCode : null;
  const label =
    outcome === 'draw'
      ? t('draw')
      : t('outcomeWin', {
          team:
            teamNameForCode(outcome === 'home' ? fixture.homeCode : fixture.awayCode) ??
            (outcome === 'home' ? fixture.homeCode : fixture.awayCode),
        });

  const ariaLabel = `${label} — ${pct}% — ${t('pointsIfRightLong', { points })}`;

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

      <span
        className={cn(
          'relative shrink-0 rounded-pill px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide',
          stance === 'consensus' ? 'bg-led-500/[0.18] text-led-300' : 'bg-gold-400/[0.14] text-gold-300',
        )}
      >
        {stance === 'consensus' ? t('tagLean') : t('tagContrarian')}
      </span>

      <span className="nums relative shrink-0 font-display text-[0.78rem] font-bold text-pitch-300">
        {t('pointsIfRight', { points })}
      </span>

      <span className="nums relative w-[46px] shrink-0 text-right font-display text-[1.04rem] font-extrabold text-mist-50">
        {pct}%
      </span>
    </button>
  );
}

/** Localized team name for the Analyst-lean line (only called for home/away leans). */
function leanTeamLabel(fixture: PredictableFixture): string {
  const code = fixture.lean === 'home' ? fixture.homeCode : fixture.awayCode;
  return teamNameForCode(code) ?? code;
}
