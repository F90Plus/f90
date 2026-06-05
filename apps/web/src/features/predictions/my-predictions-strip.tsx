import { useFormatter, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Flag } from '@/components/ui/flag';
import { cn } from '@/lib/utils';
import { teamNameForCode } from '@/lib/football/teams';
import type { UserPrediction } from './queries';

/**
 * "Mis predicciones" — a compact strip of the user's most recent calls for the
 * /home hub (full history lives at /predictions, P2-9). Pure server presentation:
 * each row is flag · pick headline · match + kickoff · stance/status chip. When the
 * list is empty it shows the HONEST empty-state from the mock ("you haven't taken
 * your first position yet") — never invented activity.
 *
 * Vocabulary law (D-037): probabilidad / posición — stance is "you vs El Analista",
 * never odds or a wager.
 */
export function MyPredictionsStrip({ predictions }: { predictions: UserPrediction[] }) {
  const t = useTranslations('app.home.myPredictions');

  if (predictions.length === 0) {
    return (
      <Card className="px-5 py-6 text-center sm:py-7">
        {/* A position-ticket glyph (your activity) — distinct from the AnalystMark
            used by the "fixtures preparing" system state above, so the two empty
            cards read as different things. */}
        <span
          aria-hidden
          className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[13px] border border-led-400/22 bg-led-500/[0.12]"
        >
          <TicketGlyph />
        </span>
        <p className="text-[0.9rem] text-mist-200">{t('emptyTitle')}</p>
        <p className="mx-auto mt-1 max-w-md text-[0.8rem] text-mist-400">{t('emptyBody')}</p>
        <a
          href="#predict"
          className="mt-4 inline-flex items-center rounded-pill border border-led-400/30 bg-led-500/16 px-4 py-2 font-display text-[0.8rem] font-bold text-led-300 transition-colors hover:bg-led-500/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400"
        >
          {t('emptyCta')}
        </a>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-mist-500/10 overflow-hidden">
      <ul>
        {predictions.map((p) => (
          <li key={p.fixtureId}>
            <PredictionRow prediction={p} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/**
 * One compact row: pick flag · headline · match + kickoff · stance + status.
 *
 * Exported so the /predictions full-history page can reuse the same row
 * presentation (DRY — both the strip and the full page render identical rows).
 */
export function PredictionRow({ prediction }: { prediction: UserPrediction }) {
  const t = useTranslations('app.home.myPredictions');
  const tp = useTranslations('predictions');
  const f = useFormatter();

  const { pick, status, correct } = prediction;
  const teamLabel = (code: string) => teamNameForCode(code) ?? code;
  const headline =
    pick === 'draw'
      ? tp('draw')
      : tp('outcomeWin', { team: teamLabel(pick === 'home' ? prediction.homeCode : prediction.awayCode) });

  const pickCode = pick === 'home' ? prediction.homeCode : pick === 'away' ? prediction.awayCode : null;

  const isSettled = status === 'settled';
  const isWon = correct === true;
  // Final score lives inline in the meta line (no disconnected below-row pill).
  const hasScore = isSettled && prediction.homeGoals != null && prediction.awayGoals != null;
  const date = f.dateTime(new Date(prediction.kickoffISO), { day: 'numeric', month: 'short' });

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 sm:px-5',
        // A correct settled call earns a quiet pitch-green elevation, so wins read
        // at a glance down the list (the loop's payoff moment).
        isSettled && isWon && 'border-l-2 border-pitch-500/40 bg-pitch-500/[0.05]',
      )}
    >
      {pickCode ? (
        <Flag code={pickCode} size="sm" />
      ) : (
        <span className="nums flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-night-700 font-display text-[0.6rem] font-bold text-mist-400 ring-1 ring-mist-200/15">
          X
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[0.92rem] font-bold text-mist-50">{headline}</div>
        <div className="mt-0.5 truncate text-[0.72rem] text-mist-400">
          {hasScore ? (
            <span className="nums">
              {teamLabel(prediction.homeCode)} {prediction.homeGoals}{' '}
              <span aria-hidden className="text-mist-500">
                –
              </span>{' '}
              {prediction.awayGoals} {teamLabel(prediction.awayCode)}
            </span>
          ) : (
            <>
              {teamLabel(prediction.homeCode)} <span className="text-mist-500">·</span>{' '}
              {teamLabel(prediction.awayCode)}
            </>
          )}{' '}
          <span className="text-mist-500">·</span> <span className="nums">{date}</span>
        </div>
      </div>

      <StatusChip prediction={prediction} isSettled={isSettled} isWon={isWon} t={t} />
    </div>
  );
}

function StatusChip({
  prediction,
  isSettled,
  isWon,
  t,
}: {
  prediction: UserPrediction;
  isSettled: boolean;
  isWon: boolean;
  t: ReturnType<typeof useTranslations<'app.home.myPredictions'>>;
}) {
  if (isSettled) {
    return (
      <span
        className={cn(
          'nums shrink-0 rounded-pill border px-2.5 py-1 font-display text-[0.68rem] font-bold',
          isWon
            ? 'border-pitch-500/30 bg-pitch-500/16 text-pitch-300'
            : 'border-mist-500/25 bg-night-800/60 text-mist-300',
        )}
      >
        {isWon ? t('statusWon', { points: prediction.awardedPoints ?? 0 }) : t('statusLost')}
      </span>
    );
  }

  const pending = prediction.status === 'pending';
  return (
    <span
      className={cn(
        'shrink-0 rounded-pill border px-2.5 py-1 font-display text-[0.68rem] font-medium',
        pending ? 'border-led-400/25 bg-led-500/12 text-led-300' : 'border-gold-400/25 bg-gold-400/12 text-gold-300',
      )}
    >
      {pending ? t('statusPending') : t('statusLocked')}
    </span>
  );
}

/** A position-ticket glyph for the "no predictions yet" empty state. */
function TicketGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 1.6 1.6 0 0 0 0 3.2v1.6a1.6 1.6 0 0 0 0 3.2 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 1.6 1.6 0 0 0 0-3.2v-1.6a1.6 1.6 0 0 0 0-3.2Z"
        stroke="var(--color-led-300)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M12 8.5v1.6M12 13.9v1.6" stroke="var(--color-led-300)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
