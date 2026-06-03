import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Frosted broadcast surface with a lit top edge. The default container for
 * anything that should feel like a premium overlay panel.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass hairline rounded-card', className)} {...props} />;
}
