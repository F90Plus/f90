import { useFormatter, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Flag } from '@/components/ui/flag';
import { AnalystMark } from '@/features/copilot/analyst-mark';
import { teamNameForCode } from '@/lib/football/teams';
import { PredictPositions } from './predict-positions';
import type { PredictableFixture } from './queries';

/**
 * The PREDICT CARD — a fixture shown as a live prediction market, with El Analista
 * (the deterministic model) as the signal. Server component: renders the market
 * shell (teams w/ real flags · "Lectura de El Analista" eyebrow · the closing
 * state from kickoff) and hands the interactive 1X2 selection / position ticket
 * to the `PredictPositions` client island.
 *
 * El Analista IS the market (real model probability); consensus/contrarian is you
 * vs El Analista (challenging it is worth more, by the honest scoring). Predicting
 * is free — Tokens are earned on a correct call, never staked (D-037: probability /
 * position / participants — never odds, stake, or a wager).
 */
export function PredictCard({ fixture }: { fixture: PredictableFixture }) {
  const t = useTranslations('predictions');
  const f = useFormatter();

  const homeName = teamNameForCode(fixture.homeCode) ?? fixture.homeCode;
  const awayName = teamNameForCode(fixture.awayCode) ?? fixture.awayCode;

  return (
    <Card className="p-5">
      {/* top row: Analyst-read eyebrow + closing state */}
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-display text-[0.62rem] font-bold uppercase tracking-[0.16em] text-volt-300">
          <AnalystMark size="xs" live={false} className="h-[18px] w-[18px]" />
          {t('marketEyebrow')}
        </span>
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.68rem] text-gold-300">
          <ClockIcon />
          <span className="nums">
            {t('closesAtKickoff')} ·{' '}
            {/* auto-unit: real minutes near kickoff (not a rounded "in 0 hours") */}
            {f.relativeTime(new Date(fixture.kickoffISO), new Date())}
          </span>
        </span>
      </div>

      {/* team line: flag · name vs name · flag */}
      <div className="mb-2 mt-1 flex items-center justify-center gap-3">
        <Flag code={fixture.homeCode} size="md" />
        <span className="truncate font-display text-[1.02rem] font-bold text-mist-50">{homeName}</span>
        <span className="shrink-0 text-[0.78rem] text-mist-500">{t('vs')}</span>
        <span className="truncate font-display text-[1.02rem] font-bold text-mist-50">{awayName}</span>
        <Flag code={fixture.awayCode} size="md" />
      </div>

      {/* pre-pick context: group + kickoff, so the user is oriented before choosing */}
      <div className="mb-3.5 text-center text-[0.72rem] text-mist-400">
        {fixture.groupLabel ? <>{fixture.groupLabel} · </> : null}
        <span className="nums">
          {f.dateTime(new Date(fixture.kickoffISO), {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* the interactive 1X2 island (selection → optimistic ticket) */}
      <PredictPositions fixture={fixture} />
    </Card>
  );
}

function ClockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
