import { CinematicImageLayer } from '@/components/atmosphere/cinematic-image-layer';
import { ATMOSPHERE } from '@/lib/atmosphere';

/**
 * The World-Cup ACCENT layer for the post-login /home hub. A thin, transparent
 * overlay ON TOP of the shared page-wide `AmbientBackdrop` (mounted in the locale
 * layout) — which already provides the broadcast grid + floodlight glows on every
 * route. /home does NOT re-implement the ambient; it adds a single aspirational
 * presence: the **World Cup trophy**, towering behind the content, whisper-faint
 * (~7% opacity) + blurred + radially faded so it dissolves into the night. Prestige
 * and international-competition feeling — what you're playing toward — while the
 * predict cards and stats always stay the protagonists.
 *
 * It is ATMOSPHERE, never a logo (the F90+ mark stays the brand) and never on the
 * cards. Founder-provided asset (transparent cutout), optimized to WebP; the dark /
 * low-opacity / blur / fade treatment is applied here in CSS, not baked into the
 * image. Fixed + decorative (aria-hidden), pure CSS/image — no WebGL, reduced-motion
 * safe, mobile-safe.
 */
export function HomeAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* a faint gold prestige glow anchored to the trophy — warmth + "the prize",
          tying to the F90+ gold without fighting the shared blue/green ambient */}
      <div className="absolute left-1/2 top-1/2 h-[58rem] w-[58rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400/[0.045] blur-[170px] md:left-[63%]" />

      {/* the World Cup trophy — towering, behind everything, whisper-faint + blurred */}
      <CinematicImageLayer
        src={ATMOSPHERE.trophy}
        sizes="(max-width: 768px) 78vw, 560px"
        className="absolute left-1/2 top-1/2 h-[122%] w-[78%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 md:left-[63%] md:w-[50%]"
        imageClassName="object-contain opacity-[0.07] blur-[2px] [mask-image:radial-gradient(closest-side,black,transparent_85%)]"
      />

      {/* legibility scrims — content always wins (over the trophy + the shared ambient) */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-950/80 via-night-950/55 to-night-950" />
      <div className="absolute inset-0 [background:radial-gradient(135%_100%_at_50%_18%,transparent_46%,rgba(5,8,15,0.6)_100%)]" />
    </div>
  );
}
