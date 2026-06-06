'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** A big tabular number that counts up once on scroll-in. Honours reduced motion. */
export function StatCounter({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    // Reduced motion (or not yet on screen) has nothing to animate — that value is
    // derived during render below, so the effect makes no synchronous setState.
    if (!inView || reduce) return;
    let raf = 0;
    let startedAt: number | null = null;
    const duration = 950;
    const tick = (now: number) => {
      startedAt ??= now;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimated(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value]);

  // Reduced motion snaps straight to the final number (once in view); otherwise the
  // animated value drives the display.
  const display = reduce ? (inView ? value : 0) : animated;

  return (
    <div ref={ref} className={cn('flex flex-col items-center gap-1 text-center', className)}>
      <span className="nums font-display text-4xl font-extrabold text-mist-50 sm:text-5xl">
        {display}
      </span>
      <span className="text-[0.7rem] uppercase tracking-[0.18em] text-mist-400 sm:text-xs">
        {label}
      </span>
    </div>
  );
}
