import { CinematicImageLayer } from '@/components/atmosphere/cinematic-image-layer';
import { ATMOSPHERE } from '@/lib/atmosphere';

/**
 * The World-Cup atmosphere layer behind the post-login /home hub. PHOTO-FIRST but
 * whisper-quiet: the globe-of-nations key art sits very low (≈9% opacity, soft-light
 * graded) above a faint broadcast grid and two slowly breathing floodlight glows,
 * under a heavy legibility scrim so it NEVER competes with the predict cards.
 *
 * Fixed + decorative (aria-hidden), pure CSS/image — no WebGL. The animations are
 * globally neutralized under `prefers-reduced-motion`, so this is reduced-motion
 * safe, mobile-safe, and perf-safe. The intent is "you're inside a stadium at the
 * Mundial", never a pasted poster.
 */
export function HomeAtmosphere() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night-950">
      {/* faint broadcast grid, fading toward the top */}
      <div className="bg-broadcast-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(125%_120%_at_50%_0%,black,transparent_70%)]" />

      {/* breathing floodlight glows — depth, not motion you'd notice */}
      <div className="animate-glow-drift absolute -top-1/4 left-1/3 h-[40rem] w-[40rem] rounded-full bg-led-500/[0.06] blur-[170px]" />
      <div
        className="animate-breathe absolute -bottom-24 -right-24 h-[32rem] w-[32rem] rounded-full bg-volt-500/[0.045] blur-[170px]"
        style={{ animationDelay: '-4s' }}
      />

      {/* WC key art — globe of nations, low + graded, anchored top-right like a broadcast bug */}
      <CinematicImageLayer
        src={ATMOSPHERE.globeFlags}
        blend="soft-light"
        sizes="(max-width: 768px) 90vw, 720px"
        className="absolute -top-[12%] right-[-14%] h-[34rem] w-[34rem] md:h-[44rem] md:w-[44rem]"
        imageClassName="object-contain opacity-[0.09] [mask-image:radial-gradient(closest-side,black,transparent_78%)]"
      />

      {/* legibility scrims — content always wins */}
      <div className="absolute inset-0 bg-gradient-to-b from-night-950/85 via-night-950/60 to-night-950" />
      <div className="absolute inset-0 [background:radial-gradient(135%_100%_at_50%_18%,transparent_42%,rgba(5,8,15,0.72)_100%)]" />
    </div>
  );
}
