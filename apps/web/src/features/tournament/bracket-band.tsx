'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { cn } from '@/lib/utils';
import type {
  Bracket,
  BracketMatch,
  KnockoutRound,
  TournamentTeam,
} from '@/lib/football/tournament';
import { BracketMatchNode } from './bracket-match-node';
import { AnalystNote } from './analyst-note';

const ROUND_ORDER: KnockoutRound[] = ['R32', 'R16', 'QF', 'SF', 'FINAL'];

/** The road to the final — desktop wallchart columns, mobile round-by-round navigator. */
export function BracketBand({
  bracket,
  favourites,
}: {
  bracket: Bracket;
  favourites: TournamentTeam[];
}) {
  const t = useTranslations('tournament.bracket');
  const tr = useTranslations('tournament.bracket.rounds');

  const byRound: Record<KnockoutRound, BracketMatch[]> = {
    R32: bracket.R32,
    R16: bracket.R16,
    QF: bracket.QF,
    SF: bracket.SF,
    THIRD: bracket.third ? [bracket.third] : [],
    FINAL: bracket.final ? [bracket.final] : [],
  };
  const rounds = ROUND_ORDER.filter((r) => byRound[r].length > 0);
  const [active, setActive] = useState<KnockoutRound>(rounds[0] ?? 'R32');

  if (rounds.length === 0) return null;

  return (
    <section id="bracket" className="relative scroll-mt-24 py-16 sm:py-24">
      <Container className="flex flex-col gap-8">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        {favourites.length > 0 ? (
          <AnalystNote>
            <span className="text-mist-300">{t('favourites')}:</span>{' '}
            <span className="font-semibold text-mist-100">
              {favourites.map((f) => f.code).join(' · ')}
            </span>
          </AnalystNote>
        ) : null}

        {/* Mobile — round tabs + a vertical list (no zoom canvas) */}
        <div className="lg:hidden">
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {rounds.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setActive(r)}
                aria-pressed={active === r}
                className={cn(
                  'shrink-0 rounded-pill px-3.5 py-1.5 font-display text-xs font-semibold transition-colors',
                  active === r ? 'bg-led-500 text-white' : 'glass text-mist-300',
                )}
              >
                {tr(r)}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            {byRound[active].map((m, i) => (
              <BracketMatchNode
                key={m.num ?? `${active}-${i}`}
                match={m}
                highlight={active === 'FINAL'}
              />
            ))}
            {active === 'FINAL' && bracket.third ? (
              <div className="mt-2">
                <span className="mb-1 block text-[0.6rem] uppercase tracking-wider text-mist-500">
                  {tr('THIRD')}
                </span>
                <BracketMatchNode match={bracket.third} />
              </div>
            ) : null}
          </div>
        </div>

        {/* Desktop — wallchart columns converging on the final */}
        <div className="hidden gap-5 overflow-x-auto pb-2 lg:flex">
          {rounds.map((r) => (
            <div key={r} className="flex min-w-[12rem] flex-1 flex-col">
              <span className="mb-3 text-center font-display text-xs font-bold uppercase tracking-wider text-mist-400">
                {tr(r)}
              </span>
              <div
                className={cn(
                  'flex flex-1 flex-col gap-3',
                  r === 'FINAL' ? 'justify-center' : 'justify-around',
                )}
              >
                {byRound[r].map((m, i) => (
                  <BracketMatchNode
                    key={m.num ?? `${r}-${i}`}
                    match={m}
                    highlight={r === 'FINAL'}
                  />
                ))}
                {r === 'FINAL' && bracket.third ? (
                  <div className="mt-3">
                    <span className="mb-1 block text-center text-[0.6rem] uppercase tracking-wider text-mist-500">
                      {tr('THIRD')}
                    </span>
                    <BracketMatchNode match={bracket.third} />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
