import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-pill font-display font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-led-500 text-white glow-led hover:-translate-y-0.5 hover:bg-led-400',
        secondary: 'glass text-mist-100 hover:border-led-400/40 hover:text-white',
        ghost: 'text-mist-200 hover:bg-night-700/60 hover:text-white',
        gold: 'bg-gold-400 text-night-950 glow-gold hover:-translate-y-0.5 hover:bg-gold-300',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

/**
 * The button. For links that should look like buttons, apply `buttonVariants(...)`
 * to a `<Link>`/`<a>` instead of nesting — keeps semantics clean.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
