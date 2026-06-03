import { CinematicImageLayer } from './cinematic-image-layer';
import { ATMOSPHERE } from '@/lib/atmosphere';

/**
 * StadiumScene — PHOTO-FIRST cinematic backdrop.
 *
 * A real night-stadium photo (ATMOSPHERE.heroImage) is the base, treated like a
 * broadcast graphic: cover · legibility scrims (left for the copy, bottom anchor) ·
 * soft-light brand grade · vignette · grain — present but never a pasted wallpaper.
 * When no image, a clean dark editorial mood. GPU-friendly, reduced-motion safe.
 */
export function StadiumScene() {
  return (
    <div
      aria-hidden="true"
      className="grain pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-night-950"
    >
      {ATMOSPHERE.heroImage ? (
        <>
          {/* real cinematic stadium photo */}
          <CinematicImageLayer
            src={ATMOSPHERE.heroImage}
            priority
            className="absolute inset-0"
            imageClassName="object-cover object-center opacity-80"
          />
          {/* legibility scrims — copy sits on the (darker) left */}
          <div className="absolute inset-0 bg-gradient-to-r from-night-950 via-night-950/55 to-night-950/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-night-950/40" />
          {/* subtle brand colour grade */}
          <div className="absolute inset-0 bg-gradient-to-tr from-led-700/30 via-transparent to-gold-500/10 mix-blend-soft-light" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-night-900 via-night-950 to-night-950" />
          <div className="absolute -top-[10%] left-1/2 h-[36rem] w-[58rem] -translate-x-1/2 rounded-[50%] bg-led-500/10 blur-[150px]" />
          <div className="absolute -bottom-24 -left-24 h-[26rem] w-[26rem] rounded-full bg-pitch-500/[0.06] blur-[130px]" />
          <div className="animate-breathe absolute top-1/4 -right-28 h-[26rem] w-[26rem] rounded-full bg-volt-500/[0.07] blur-[130px]" />
        </>
      )}

      {/* cinematic vignette */}
      <div className="absolute inset-0 [background:radial-gradient(130%_95%_at_50%_25%,transparent_45%,rgba(5,8,15,0.78)_100%)]" />
    </div>
  );
}
