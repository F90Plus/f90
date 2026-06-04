import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TournamentGroup } from '@/lib/football/tournament';
import { NationFlag } from './nation-flag';

/** One group of four, as drawn. Highlights the host and (optionally) the group of the death. */
export function GroupCard({
  group,
  isToughest,
  className,
}: {
  group: TournamentGroup;
  isToughest?: boolean;
  className?: string;
}) {
  const t = useTranslations('tournament.groups');

  return (
    <Card
      className={cn(
        'flex flex-col gap-3.5 p-5 transition-colors duration-300',
        isToughest && 'glow-pitch border-pitch-500/30',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-led-500/15 font-display text-sm font-extrabold text-led-300">
            {group.id}
          </span>
          <span className="font-display text-sm font-bold text-mist-100">{group.label}</span>
        </div>
        {isToughest ? (
          <Badge tone="live" className="px-2 py-0.5 text-[0.62rem] uppercase tracking-wide">
            {t('groupOfDeath')}
          </Badge>
        ) : null}
      </div>

      <ul className="flex flex-col gap-2.5">
        {group.teams.map((team) => (
          <li key={team.code} className="flex items-center gap-2.5">
            <NationFlag team={team} size="sm" />
            <span className="min-w-0 flex-1 truncate text-sm text-mist-200">{team.name}</span>
            {team.isHost ? (
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden />
            ) : null}
            <span className="nums text-[0.7rem] font-semibold text-mist-500">{team.code}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
