import { cn } from '@/lib/utils';
import { avatarColors, avatarInitial } from '@/lib/avatar';

/**
 * Own-IP identity disc (D-025): a deterministic gradient + the handle's initial.
 * No external image, no licensed likeness — every profile looks distinct and
 * on-brand. `size` is in pixels (the font scales with it).
 */
export function Avatar({
  handle,
  size = 64,
  className,
}: {
  handle: string;
  size?: number;
  className?: string;
}) {
  const { from, to } = avatarColors(handle);
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-display font-bold text-night-950 ring-1 ring-mist-200/15',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.4),
        background: `linear-gradient(140deg, ${from}, ${to})`,
      }}
    >
      {avatarInitial(handle)}
    </span>
  );
}
