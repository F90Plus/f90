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
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let startedAt: number | null = null;
    const duration = 950;
    const tick = (now: number) => {
      startedAt ??= now;
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, value]);

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
