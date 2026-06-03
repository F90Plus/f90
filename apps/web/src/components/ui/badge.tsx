import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'border-mist-500/20 bg-night-800/60 text-mist-300',
        live: 'border-flare-500/40 bg-flare-500/10 text-flare-400',
        free: 'border-lime-500/40 bg-lime-500/10 text-lime-300',
        led: 'border-led-500/40 bg-led-500/10 text-led-300',
        gold: 'border-gold-400/40 bg-gold-400/10 text-gold-300',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
