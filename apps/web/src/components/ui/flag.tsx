import { cn } from '@/lib/utils';
import { flagAssetFor } from '@/lib/football/flags';
import { teamMeta, teamNameForCode } from '@/lib/football/teams';

const SIZES = {
  sm: 'h-7 w-7 text-[0.6rem] rounded-[9px]',
  md: 'h-9 w-9 text-[0.65rem] rounded-[10px]',
  lg: 'h-[42px] w-[42px] text-[0.78rem] rounded-xl',
} as const;

export type FlagSize = keyof typeof SIZES;

/**
 * A nation's flag as a premium rounded chip, resolved from a 3-letter broadcast
 * code (fixtures' `home_code` / `away_code`). Bridges code → name → vendored SVG
 * via `teamNameForCode` + `flagAssetFor`, falling back to the accent-gradient
 * code token when no flag asset exists — never breaks.
 *
 * Decorative by default (`aria-hidden`): callers always show the team name as
 * text alongside, so the flag carries no independent meaning for assistive tech.
 * Shares the rounded-square treatment used across the predict card (matching the
 * circular `NationFlag` in look but keyed by code, not a tournament team object).
 */
export function Flag({
  code,
  size = 'md',
  className,
}: {
  code: string;
  size?: FlagSize;
  className?: string;
}) {
  const name = teamNameForCode(code);
  const asset = name ? flagAssetFor(name) : null;
  const accent = name ? teamMeta(name).accent : '#828FB2';

  if (!asset) {
    return (
      <span
        aria-hidden
        className={cn(
          'nums flex shrink-0 items-center justify-center font-display font-bold text-night-950 ring-1 ring-mist-200/15',
          SIZES[size],
          className,
        )}
        style={{ background: `linear-gradient(140deg, ${accent}, ${accent}99)` }}
      >
        {code}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        'block shrink-0 bg-cover bg-center ring-1 ring-mist-200/15',
        SIZES[size],
        className,
      )}
      style={{ backgroundImage: `url(${asset})` }}
    />
  );
}
