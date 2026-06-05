import { CinematicImageLayer } from '@/components/atmosphere/cinematic-image-layer';
import { ATMOSPHERE } from '@/lib/atmosphere';

/**
 * The World-Cup ACCENT layer for the post-login /home hub. A thin, transparent
 * overlay ON TOP of the shared page-wide `AmbientBackdrop` (mounted in the locale
 * layout) — which already provides the broadcast grid + floodlight glows on every
 * route. /home therefore does NOT re-implement the ambient (the old version did,
 * with an opaque `bg-night-950` that fully occluded the shared backdrop — wasted
 * work + a duplicated grid/glow recipe). It only adds the globe-of-nations key art
 * (whisper-quiet, soft-light graded) under a legibility scrim so the WC presence
 * never competes with the predict cards.
 *
 * Fixed + decorative (aria-hidden), pure CSS/image — no WebGL, reduced-motion safe,
 * mobile-safe. The intent is "you're inside a stadium at the Mundial", never a
 * pasted poster.
 */
export function HomeAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* WC key art — globe of nations, low + graded, anchored top-right like a broadcast bug */}
      <CinematicImageLayer
        src={ATMOSPHERE.globeFlags}
        blend="soft-light"
        sizes="(max-width: 768px) 90vw, 720px"
        className="absolute -top-[12%] right-[-14%] h-[34rem] w-[34rem] md:h-[44rem] md:w-[44rem]"
        imageClassName="object-contain opacity-[0.09] [mask-image:radial-gradient(closest-side,black,transparent_78%)]"
      />

      {/* legibility scrims — content always wins (over both the globe and the shared ambient) */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-950/85 via-night-950/55 to-night-950" />
      <div className="absolute inset-0 [background:radial-gradient(135%_100%_at_50%_18%,transparent_45%,rgba(5,8,15,0.66)_100%)]" />
    </div>
  );
}
