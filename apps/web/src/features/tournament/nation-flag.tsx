import { cn } from '@/lib/utils';
import type { TournamentTeam } from '@/lib/football/tournament';

const SIZES = {
  sm: 'h-6 w-6 text-[0.5rem]',
  md: 'h-9 w-9 text-[0.6rem]',
  lg: 'h-14 w-14 text-xs',
} as const;

/**
 * A nation's flag as a premium circular token (vendored SVG, broadcast treatment).
 * Falls back to the accent-gradient code token when no flag asset exists — never
 * breaks. Decorative: the nation name is always shown as text alongside.
 */
export function NationFlag({
  team,
  size = 'md',
  className,
}: {
  team: TournamentTeam;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const ring = team.isHost ? 'ring-gold-400/60' : 'ring-mist-200/15';

  if (!team.flag) {
    return (
      <span
        aria-hidden
        className={cn(
          'flex shrink-0 items-center justify-center rounded-full font-display font-bold text-night-950 ring-1',
          SIZES[size],
          ring,
          className,
        )}
        style={{ background: `linear-gradient(140deg, ${team.accent}, ${team.accent}99)` }}
      >
        {team.code}
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-hidden
      className={cn('block shrink-0 rounded-full bg-cover bg-center ring-1', SIZES[size], ring, className)}
      style={{ backgroundImage: `url(${team.flag})` }}
    />
  );
}
