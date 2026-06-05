import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { getUserPredictions, type UserPrediction } from '@/features/predictions/queries';
import { groupPredictions } from '@/features/predictions/predictions-model';
import { PredictionRow } from '@/features/predictions/my-predictions-strip';
import { AnalystMark } from '@/features/copilot/analyst-mark';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'predictions.page' });
  return { title: t('metaTitle'), robots: { index: false } };
}

/**
 * /predictions — full history of the user's positions, grouped into "Activas"
 * (pending + locked) and "Resueltas" (settled). The (app) layout already
 * guarantees an onboarded session; `return null` is belt-and-suspenders.
 *
 * Vocabulary law (D-037): probabilidad / posición — never odds/bet/cuotas.
 * Mobile-first premium glass-card rows, not a data table.
 */
export default async function PredictionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // guaranteed by the (app) layout

  const [t, predictions] = await Promise.all([
    getTranslations('predictions.page'),
    getUserPredictions(supabase),
  ]);

  const { active, resolved } = groupPredictions(predictions);
  const isEmpty = active.length === 0 && resolved.length === 0;

  return (
    <Container className="py-10 sm:py-14">
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <span className="eyebrow">{t('eyebrow')}</span>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-[1.9rem]">
          {t('title')}
        </h1>
        <p className="mt-1.5 text-[0.875rem] text-mist-400">{t('subtitle')}</p>
      </div>

      {/* ── EMPTY STATE ─────────────────────────────────────────────── */}
      {isEmpty ? (
        <Card className="mx-auto max-w-lg px-6 py-12 text-center">
          <span
            aria-hidden
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-led-400/22 bg-led-500/[0.12]"
          >
            <AnalystMark size="sm" live={false} className="h-7 w-7 ring-0" />
          </span>
          <p className="font-display text-[1.05rem] font-bold text-mist-100">{t('emptyTitle')}</p>
          <p className="mx-auto mt-2 max-w-md text-[0.85rem] leading-relaxed text-mist-400">
            {t('emptyBody')}
          </p>
          <Link
            href="/home"
            className="mt-6 inline-flex items-center rounded-pill border border-led-400/30 bg-led-500/16 px-4 py-2 font-display text-[0.82rem] font-bold text-led-300 transition-colors hover:bg-led-500/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400"
          >
            {t('emptyCta')}
          </Link>
        </Card>
      ) : (
        <>
          {/* ── ACTIVAS — pending + locked ─────────────────────────── */}
          {active.length > 0 ? (
            <section aria-labelledby="predictions-active-heading" className="mb-10">
              <h2
                id="predictions-active-heading"
                className="mb-3.5 font-display text-[1.1rem] font-bold text-mist-200"
              >
                {t('activeTitle')}
                <span className="ml-2 font-display text-[0.78rem] font-medium text-mist-500">
                  ({active.length})
                </span>
              </h2>
              <Card className="divide-y divide-mist-500/10 overflow-hidden">
                <ul>
                  {active.map((p) => (
                    <li key={p.fixtureId}>
                      <PredictionRow prediction={p} />
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}

          {/* ── RESUELTAS — settled, with score + win/loss ────────── */}
          {resolved.length > 0 ? (
            <section aria-labelledby="predictions-resolved-heading">
              <h2
                id="predictions-resolved-heading"
                className="mb-3.5 font-display text-[1.1rem] font-bold text-mist-200"
              >
                {t('resolvedTitle')}
                <span className="ml-2 font-display text-[0.78rem] font-medium text-mist-500">
                  ({resolved.length})
                </span>
              </h2>
              <Card className="divide-y divide-mist-500/10 overflow-hidden">
                <ul>
                  {resolved.map((p) => (
                    <li key={p.fixtureId}>
                      <ResolvedPredictionRow prediction={p} />
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ) : null}
        </>
      )}
    </Container>
  );
}

/**
 * Extended settled row: reuses PredictionRow and augments it with the final
 * scoreline when goals are known. Falls back gracefully to PredictionRow when
 * the scoreline is not yet populated.
 */
function ResolvedPredictionRow({ prediction }: { prediction: UserPrediction }) {
  const { homeGoals, awayGoals } = prediction;

  if (homeGoals == null || awayGoals == null) {
    return <PredictionRow prediction={prediction} />;
  }

  return (
    <div className="relative">
      <PredictionRow prediction={prediction} />
      <ScorelinePill
        homeGoals={homeGoals}
        awayGoals={awayGoals}
        homeCode={prediction.homeCode}
        awayCode={prediction.awayCode}
        correct={prediction.correct}
      />
    </div>
  );
}

/** Final result pill shown beneath a settled row when goals are known. */
function ScorelinePill({
  homeGoals,
  awayGoals,
  homeCode,
  awayCode,
  correct,
}: {
  homeGoals: number;
  awayGoals: number;
  homeCode: string;
  awayCode: string;
  correct: boolean | null;
}) {
  const isWon = correct === true;
  return (
    <div className="flex items-center gap-2 pb-2.5 pl-[3.75rem] pr-4">
      <span
        className={`nums inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 font-display text-[0.7rem] font-bold ${
          isWon
            ? 'border-pitch-500/30 bg-pitch-500/10 text-pitch-300'
            : 'border-mist-500/20 bg-night-800/50 text-mist-400'
        }`}
        aria-label={`Final: ${homeCode} ${homeGoals} – ${awayGoals} ${awayCode}`}
      >
        {homeCode} {homeGoals} <span aria-hidden className="text-mist-500">–</span> {awayGoals}{' '}
        {awayCode}
      </span>
    </div>
  );
}
