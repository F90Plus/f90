import { cn } from '@/lib/utils';

/**
 * A small broadcast corner graphic (lower-third style): an accent tick + a
 * tracked label. Reusable — position it with `className` (e.g. corner of a hero).
 */
export function BroadcastOverlay({ label, className }: { label: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none flex items-center gap-2 select-none', className)}
    >
      <span className="h-3.5 w-px bg-lime-400/70" />
      <span className="font-display text-[0.6rem] font-semibold tracking-[0.3em] text-mist-400 uppercase">
        {label}
      </span>
    </div>
  );
}
