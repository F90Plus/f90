import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/navigation';
import { getRankingPage, type RankingPageEntry } from '@/lib/rankings';
import { avatarColors, avatarInitial } from '@/lib/avatar';
import { cn } from '@/lib/utils';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ranking' });
  return { title: t('metaTitle'), robots: { index: false } };
}

/**
 * /ranking — the global leaderboard. Post-login, in the (app) group (auth gated).
 *
 * Reads the real `global_rankings` view via the public (anon/ISR) client. The
 * authenticated server client only supplies the current user's id so we can
 * highlight their row — no second Supabase query for ranking data. Graceful-
 * degrade: returns `[]` on any failure (missing env, DB error, pre-scoring) →
 * shows the honest empty-state, never a 500.
 *
 * Design principles:
 *   - Mobile-first card rows, NOT a `<table>` grid that reads admin/backoffice.
 *   - Top-3 get a gold/led emphasis (tasteful — rank disc + name tint, not kitsch).
 *   - Current-user row is highlighted and labelled via text + aria-label (not only colour).
 *   - Honest empty-state pre-scoring (reuses the D-043 open-board pattern).
 *   - Vocabulary D-037: probabilidad / puntos — never odds/apuestas/cuotas.
 *   - Reduced-motion safe: no entry animations (ISR page, no client JS needed).
 */
export default async function RankingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Auth server client — only used to get the current user's id for row highlighting.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // The (app) layout already guarantees a session; belt-and-suspenders null-guard.
  const currentUserId = user?.id ?? null;

  const [t, entries] = await Promise.all([
    getTranslations('ranking'),
    getRankingPage(100, currentUserId),
  ]);

  const isEmpty = entries.length === 0;
  // Find the current user's entry (null = unranked / no points yet).
  const myEntry = entries.find((e) => e.isCurrentUser) ?? null;

  return (
    <Container className="py-10 sm:py-14">
      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <span className="eyebrow">{t('eyebrow')}</span>
        <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-white sm:text-[1.9rem]">
          {t('title')}
        </h1>
        <p className="mt-1.5 text-[0.875rem] text-mist-400">
          {isEmpty ? t('subtitleEmpty') : t('subtitle')}
        </p>
      </div>

      {/* ── EMPTY STATE — pre-scoring honest board ───────────────────── */}
      {isEmpty ? (
        <EmptyBoard
          title={t('subtitleEmpty')}
          unrankedTitle={t('unrankedTitle')}
          unrankedBody={t('unrankedBody')}
          unrankedCta={t('unrankedCta')}
        />
      ) : (
        <>
          {/* ── THE BOARD ────────────────────────────────────────────── */}
          <Card className="overflow-hidden">
            {/* Column headers */}
            <div
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-mist-500/10 px-5 py-3 text-[0.68rem] uppercase tracking-widest text-mist-500 sm:px-6"
              role="row"
              aria-hidden="true"
            >
              <span>{t('colRank')}</span>
              <span>{t('colPlayer')}</span>
              <span className="text-right">{t('colPoints')}</span>
            </div>

            <ul role="list" aria-label={t('title')}>
              {entries.map((entry) => (
                <RankingRow
                  key={entry.username}
                  entry={entry}
                  yourLabel={t('yourRow')}
                  pointsLabel={(pts: number) => t('points', { points: pts })}
                />
              ))}
            </ul>
          </Card>

          {/* ── UNRANKED HINT — logged-in user has no points yet ─────── */}
          {myEntry == null && currentUserId != null ? (
            <UnrankedHint
              title={t('unrankedTitle')}
              body={t('unrankedBody')}
              cta={t('unrankedCta')}
            />
          ) : null}
        </>
      )}
    </Container>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (server, no 'use client' needed)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A single leaderboard row.
 *
 * Accessibility: the current-user row is marked with `aria-current="true"` and
 * the "Tú / You" label is rendered in text (not only a colour change). Numbers
 * use `tabular-nums` so the column aligns across all ranks.
 */
function RankingRow({
  entry,
  yourLabel,
  pointsLabel,
}: {
  entry: RankingPageEntry;
  yourLabel: string;
  pointsLabel: (pts: number) => string;
}) {
  const { from, to } = avatarColors(entry.username);
  const name = entry.displayName || `@${entry.username}`;
  const isTop3 = entry.rank <= 3;
  const isMine = entry.isCurrentUser;

  return (
    <li
      aria-current={isMine ? 'true' : undefined}
      id={isMine ? 'my-ranking-row' : undefined}
      className={cn(
        'grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 px-5 py-3.5 transition-colors sm:px-6',
        isMine
          ? 'border-l-2 border-led-400 bg-led-500/[0.07]'
          : 'hover:bg-night-800/40',
      )}
    >
      {/* Rank disc */}
      <span
        className={cn(
          'nums font-display text-[1rem] font-extrabold leading-none',
          isTop3 ? 'text-gold-400' : isMine ? 'text-led-300' : 'text-mist-400',
        )}
        aria-label={`Rank ${entry.rank}`}
      >
        {entry.rank}
      </span>

      {/* Player identity */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Own-IP avatar token (D-025) */}
        <span
          aria-hidden
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[0.65rem] font-bold text-night-950"
          style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
        >
          {avatarInitial(name)}
        </span>

        <div className="flex min-w-0 flex-col gap-0.5">
          <Link
            href={`/u/${entry.username}`}
            className={cn(
              'truncate rounded text-sm font-semibold transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400',
              isTop3 ? 'text-white' : isMine ? 'text-led-200' : 'text-mist-100',
            )}
          >
            {name}
          </Link>
          {isMine ? (
            <span className="text-[0.68rem] font-medium text-led-400">{yourLabel}</span>
          ) : null}
        </div>

        {/* Nation flag */}
        {entry.flag ? (
          <span
            aria-hidden
            className="block h-4 w-4 shrink-0 rounded-full bg-cover bg-center ring-1 ring-mist-200/15"
            style={{ backgroundImage: `url(${entry.flag})` }}
          />
        ) : null}
      </div>

      {/* Points */}
      <span
        className={cn(
          'nums text-right text-sm font-semibold',
          isTop3 ? 'text-gold-300' : isMine ? 'text-led-200' : 'text-mist-200',
        )}
      >
        {pointsLabel(entry.points)}
      </span>
    </li>
  );
}

/**
 * Honest empty-state for pre-scoring phase. Reuses the D-043 "open seats"
 * pattern from the homepage teaser — three phantom podium slots + the
 * unranked hint. Never shows fake names or zero-point rows.
 */
function EmptyBoard({
  title,
  unrankedTitle,
  unrankedBody,
  unrankedCta,
}: {
  title: string;
  unrankedTitle: string;
  unrankedBody: string;
  unrankedCta: string;
}) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <ul aria-label={title} role="list">
          {[1, 2, 3].map((rank) => (
            <li
              key={rank}
              aria-hidden
              className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 px-5 py-3.5 sm:px-6"
            >
              <span
                className={cn(
                  'nums font-display text-[1rem] font-extrabold leading-none',
                  rank <= 3 ? 'text-gold-400/40' : 'text-mist-600',
                )}
              >
                {rank}
              </span>
              <div className="flex items-center gap-3">
                <span className="h-8 w-8 shrink-0 rounded-lg border border-dashed border-mist-500/20 bg-night-800/25" />
                <span className="h-2.5 w-28 rounded-full bg-mist-500/10 motion-safe:animate-pulse" />
              </div>
              <span className="text-right text-sm text-mist-600">—</span>
            </li>
          ))}
        </ul>
      </Card>
      <UnrankedHint title={unrankedTitle} body={unrankedBody} cta={unrankedCta} />
    </div>
  );
}

/**
 * Subtle nudge shown to unranked / pre-scoring users. Linked to /home so they
 * can make their first prediction without hunting around.
 */
function UnrankedHint({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Card className="mx-auto max-w-lg px-6 py-8 text-center">
      <p className="font-display text-[1rem] font-bold text-mist-100">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[0.85rem] leading-relaxed text-mist-400">{body}</p>
      <Link
        href="/home"
        className="mt-5 inline-flex items-center rounded-pill border border-led-400/30 bg-led-500/16 px-4 py-2 font-display text-[0.82rem] font-bold text-led-300 transition-colors hover:bg-led-500/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400"
      >
        {cta}
      </Link>
    </Card>
  );
}
