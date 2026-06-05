import { useFormatter, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Flag } from '@/components/ui/flag';
import { AnalystMark } from '@/features/copilot/analyst-mark';
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
        <span
          aria-hidden
          className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[13px] border border-led-400/22 bg-led-500/[0.12]"
        >
          <AnalystMark size="xs" live={false} className="h-[22px] w-[22px] ring-0" />
        </span>
        <p className="text-[0.9rem] text-mist-200">{t('emptyTitle')}</p>
        <p className="mx-auto mt-1 max-w-md text-[0.8rem] text-mist-500">{t('emptyBody')}</p>
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

/** One compact row: pick flag · headline · match + kickoff · stance + status. */
function PredictionRow({ prediction }: { prediction: UserPrediction }) {
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

  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
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
          {teamLabel(prediction.homeCode)} <span className="text-mist-500">·</span>{' '}
          {teamLabel(prediction.awayCode)} <span className="text-mist-500">·</span>{' '}
          <span className="nums">
            {f.dateTime(new Date(prediction.kickoffISO), { day: 'numeric', month: 'short' })}
          </span>
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
