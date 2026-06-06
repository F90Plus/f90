import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Broadcast lower-third label — the shared `.eyebrow` look (uppercase, tracked,
 * LED, with the leading lime accent tick; defined in globals.css) as a single
 * primitive, so the markup isn't copy-pasted across routes. `SectionHeading` and
 * the standalone route eyebrows all render through this.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={cn('eyebrow', className)}>{children}</span>;
}
