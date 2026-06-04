'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { BracketSlot } from '@/lib/football/tournament';
import type { BracketMatch } from '@/lib/football/tournament';
import { NationFlag } from './nation-flag';

function SlotRow({ slot }: { slot: BracketSlot }) {
  const t = useTranslations('tournament.bracket.slot');
  const { ref } = slot;

  if (ref.kind === 'team') {
    return (
      <div className="flex items-center gap-2">
        <NationFlag team={ref.team} size="sm" />
        <span className="truncate font-display text-sm font-bold text-mist-50">{ref.team.code}</span>
      </div>
    );
  }

  const label =
    ref.kind === 'group-winner'
      ? t('groupWinner', { group: ref.group })
      : ref.kind === 'group-runner'
        ? t('groupRunner', { group: ref.group })
        : ref.kind === 'third'
          ? t('third', { groups: ref.groups.join('/') })
          : ref.kind === 'match-winner'
            ? t('matchWinner', { match: ref.match })
            : ref.kind === 'match-loser'
              ? t('matchLoser', { match: ref.match })
              : slot.raw || t('tbd');

  return (
    <div className="flex items-center gap-2">
      <span
        className="h-6 w-6 shrink-0 rounded-full border border-dashed border-mist-500/30"
        aria-hidden
      />
      <span className="truncate text-xs text-mist-400">{label}</span>
    </div>
  );
}

/** A single knockout tie — two slots (decided teams or advancement feeds) + venue. */
export function BracketMatchNode({
  match,
  highlight,
  className,
}: {
  match: BracketMatch;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'glass hairline flex w-full flex-col gap-2 rounded-xl p-3',
        highlight && 'glow-gold border-gold-400/40',
        className,
      )}
    >
      <SlotRow slot={match.home} />
      <div className="h-px bg-mist-500/10" />
      <SlotRow slot={match.away} />
      {match.ground ? (
        <span className="mt-0.5 truncate text-[0.6rem] text-mist-500">{match.ground}</span>
      ) : null}
    </div>
  );
}
