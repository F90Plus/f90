import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { TournamentTeam } from '@/lib/football/tournament';
import { NationFlag } from './nation-flag';

/** Compact premium tile for one qualified nation: flag, name, confederation/host + group. */
export function NationCard({
  team,
  groupId,
  className,
}: {
  team: TournamentTeam;
  groupId?: string;
  className?: string;
}) {
  const t = useTranslations('tournament.nations');

  return (
    <Card
      className={cn(
        'group flex items-center gap-3 p-3 transition-all duration-300 hover:-translate-y-0.5',
        team.isHost
          ? 'hover:border-gold-400/50 hover:shadow-[0_18px_50px_-30px_rgba(245,166,35,0.6)]'
          : 'hover:border-pitch-500/40 hover:shadow-[0_18px_50px_-30px_rgba(11,184,115,0.55)]',
        className,
      )}
    >
      <NationFlag team={team} size="md" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate font-display text-sm font-bold text-mist-50">{team.name}</span>
        <span className="flex items-center gap-1 text-[0.7rem]">
          {team.isHost ? (
            <span className="font-semibold text-gold-300">{t('host')}</span>
          ) : (
            <span className="text-mist-400">{team.confederation}</span>
          )}
          {groupId ? <span className="text-mist-500">· {groupId}</span> : null}
        </span>
      </div>
    </Card>
  );
}
