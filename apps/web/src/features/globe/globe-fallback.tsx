import Image from 'next/image';
import { ATMOSPHERE } from '@/lib/atmosphere';

/**
 * Static fallback for the 3D globe — shown on no-WebGL / load failure (error boundary)
 * so the hero is never a broken canvas. Uses the World Cup key-art globe, treated to sit
 * in the night scene. Premium, not a placeholder.
 */
export function GlobeFallback() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]" aria-hidden="true">
      <Image
        src={ATMOSPHERE.globeFlags}
        alt=""
        fill
        sizes="(max-width: 900px) 84vw, 540px"
        className="object-contain opacity-90 [mask-image:radial-gradient(circle,black_62%,transparent_82%)]"
      />
    </div>
  );
}

/** Lightweight loading placeholder while the WebGL globe lazy-loads (no heavy asset). */
export function GlobeSkeleton() {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[540px]"
      aria-hidden="true"
    >
      <div className="animate-breathe absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_34%_30%,#16223d,#070d18_70%)] shadow-[inset_-12px_-16px_70px_rgba(0,0,0,0.7),0_0_80px_-10px_rgba(61,116,255,0.35)]" />
    </div>
  );
}
