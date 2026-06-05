import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';

/**
 * Route-level loading skeleton for the /home hub. The page streams several
 * Supabase reads (profile · wallet · countries · fixtures · predictions); this
 * holds the shell — standing strip + predict hero — at the right dimensions so
 * there's no blank flash or layout shift when the data lands. Pure CSS pulse,
 * reduced-motion safe (motion-safe only). Decorative → aria-hidden.
 */
export default function HomeLoading() {
  return (
    <Container className="py-10 sm:py-12" aria-hidden="true">
      {/* standing strip */}
      <Card className="flex flex-wrap items-center gap-x-6 gap-y-4 p-5 sm:px-6">
        <span className="mr-auto h-7 w-44 rounded-md bg-mist-500/10 motion-safe:animate-pulse" />
        {[0, 1, 2].map((i) => (
          <span key={i} className="flex flex-col gap-1.5">
            <span className="h-2.5 w-14 rounded bg-mist-500/10 motion-safe:animate-pulse" />
            <span className="h-5 w-16 rounded bg-mist-500/10 motion-safe:animate-pulse" />
          </span>
        ))}
      </Card>

      {/* "Haz tu predicción" heading + hero card */}
      <section className="mt-10">
        <span className="block h-3 w-28 rounded bg-mist-500/10 motion-safe:animate-pulse" />
        <span className="mt-2.5 block h-7 w-52 rounded-md bg-mist-500/10 motion-safe:animate-pulse" />
        <div className="mx-auto mt-3.5 max-w-xl">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="h-3 w-28 rounded bg-mist-500/10 motion-safe:animate-pulse" />
              <span className="h-3 w-20 rounded bg-mist-500/10 motion-safe:animate-pulse" />
            </div>
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-9 w-9 rounded-md bg-mist-500/10 motion-safe:animate-pulse" />
              <span className="h-5 w-40 rounded bg-mist-500/10 motion-safe:animate-pulse" />
              <span className="h-9 w-9 rounded-md bg-mist-500/10 motion-safe:animate-pulse" />
            </div>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-11 rounded-[14px] bg-mist-500/10 motion-safe:animate-pulse" />
              ))}
            </div>
          </Card>
        </div>
      </section>
    </Container>
  );
}
