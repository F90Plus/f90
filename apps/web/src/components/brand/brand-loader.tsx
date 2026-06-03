import { Logo } from '@/components/layout/logo';

/**
 * Branded loading state — the F90+ logo, glowing and breathing, over a shimmer.
 *
 * NOT wired as a route-level `loading.tsx`: the homepage is static, so a route
 * Suspense boundary is unnecessary (and would gate a static page behind streaming).
 * Drop this into a `loading.tsx` for genuinely async routes later (e.g. live
 * `/matches`), where a loading state is actually meaningful.
 */
export function BrandLoader() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-7">
      <div className="animate-float">
        <Logo height={128} glow="lg" href={null} />
      </div>
      <div className="h-1 w-36 overflow-hidden rounded-pill bg-night-800">
        <div className="animate-shimmer h-full w-full bg-gradient-to-r from-transparent via-led-400 to-transparent" />
      </div>
    </div>
  );
}
