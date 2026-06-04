'use client';

import { useId } from 'react';
import { sparkPath } from '@/data/markets';
import { cn } from '@/lib/utils';

const W = 96;
const H = 36;
const PAD = 3;

/**
 * A micro probability-trend sparkline: a luminous line with a soft area fill and
 * an end node, coloured by direction (pitch-green rising / flare-red falling). It
 * turns a single number into a *moving market*. SVG only; the stroke keeps its
 * width under non-uniform scaling so it reads crisp at any box size.
 */
export function Sparkline({
  values,
  up,
  className,
}: {
  values: number[];
  up: boolean;
  className?: string;
}) {
  const gid = useId();
  const pts = sparkPath(values, W, H, PAD);
  if (!pts) return null;

  const last = pts.split(' ').at(-1)?.split(',') ?? [];
  const color = up ? 'var(--color-pitch-400)' : 'var(--color-flare-400)';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      className={cn('overflow-visible', className)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${W},${H} 0,${H}`} fill={`url(#${gid})`} />
      <polyline
        points={pts}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {last.length === 2 ? (
        <circle cx={last[0]} cy={last[1]} r="2.6" fill={color} vectorEffect="non-scaling-stroke" />
      ) : null}
    </svg>
  );
}
