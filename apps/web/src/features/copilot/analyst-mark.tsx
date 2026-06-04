import { cn } from '@/lib/utils';

const DIM = {
  xs: 'h-6 w-6 rounded-md',
  sm: 'h-8 w-8 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
} as const;

/**
 * The Analyst's face — an own-IP identity token (D-025) for F90+'s deterministic
 * Copilot, "El Analista". A dark broadcast token with an LED inner glow and a
 * luminous rising-trend glyph capped by a gold "read" node: it says *live market
 * intelligence* at a glance, not a chatbot. A pulse marks the live/analyzing
 * state. Pure CSS/SVG → safe in server components, reduced-motion friendly.
 */
export function AnalystMark({
  size = 'md',
  live = true,
  className,
}: {
  size?: keyof typeof DIM;
  live?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center ring-1 ring-led-400/30',
        DIM[size],
        className,
      )}
      style={{
        background:
          'radial-gradient(125% 125% at 28% 18%, color-mix(in oklab, var(--color-led-500) 34%, var(--color-night-850)), var(--color-night-950) 78%)',
        boxShadow: 'inset 0 1px 0 0 color-mix(in oklab, var(--color-led-300) 35%, transparent)',
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-[58%] w-[58%]">
        {/* baseline */}
        <path d="M4 19h16" stroke="currentColor" className="text-mist-500/40" strokeWidth="1.4" strokeLinecap="round" />
        {/* rising analysis trend */}
        <path
          d="M5 15.5 L10 12 L14 13.5 L19 6.5"
          className="text-volt-300"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* the "read" — a gold insight node at the trend's peak */}
        <circle cx="19" cy="6.5" r="2.3" className="fill-gold-400" />
      </svg>

      {live ? (
        <span className="absolute -right-1 -top-1 inline-flex h-3 w-3">
          <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-pitch-400/70" />
          <span className="relative m-auto inline-flex h-2 w-2 rounded-full bg-pitch-400 ring-2 ring-night-950" />
        </span>
      ) : null}
    </span>
  );
}
