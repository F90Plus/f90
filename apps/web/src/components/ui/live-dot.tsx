import { cn } from '@/lib/utils';

/** Pulsing "live" indicator — pure CSS, safe in server components. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex h-2 w-2', className)} aria-hidden="true">
      <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-flare-500" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-flare-400" />
    </span>
  );
}
