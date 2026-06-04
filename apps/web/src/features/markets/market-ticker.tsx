import { getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';
import { markets, marketDirection, type Market } from '@/data/markets';

/**
 * Live-market ticker — a continuous prediction-market tape under the Hero that
 * tells the eye, in three seconds, that F90+ is a MARKET (D-034), not a fixtures
 * page. Financial-terminal language: tabular numbers, green ▲ / red ▼ moves, a
 * seamless scroll. Premium, not casino — values are implied probabilities, not
 * odds. Server-rendered; the motion is pure CSS (marquee), paused on hover and
 * frozen under prefers-reduced-motion. A "soon" tag keeps it honest (preview).
 */

type Labels = { q: (m: Market) => string };

function MarketChip({ m, labels }: { m: Market; labels: Labels }) {
  const up = marketDirection(m.delta) === 'up';
  return (
    <li className="flex items-center whitespace-nowrap">
      {/* leading divider — gives the tape its terminal cadence, seamless across the loop */}
      <span aria-hidden className="mx-5 h-3.5 w-px bg-mist-500/15 sm:mx-6" />
      <span className="text-sm font-semibold text-mist-100">{m.subject}</span>
      <span className="ml-2 text-sm text-mist-400">{labels.q(m)}</span>
      <span className="nums ml-3 text-sm font-semibold text-mist-50">{m.chance}%</span>
      <span
        className={cn(
          'nums ml-2 text-xs font-semibold tabular-nums',
          up ? 'text-pitch-300' : 'text-flare-400',
        )}
      >
        {up ? '▲' : '▼'} {Math.abs(m.delta).toFixed(1)}%
      </span>
    </li>
  );
}

function MarketRow({ labels, hidden }: { labels: Labels; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden}>
      {markets.map((m, i) => (
        <MarketChip key={`${m.subject}-${m.q}-${i}`} m={m} labels={labels} />
      ))}
    </ul>
  );
}

export async function MarketTicker() {
  const t = await getTranslations('markets');
  const labels: Labels = { q: (m) => t(`q.${m.q}`, { group: m.param ?? '' }) };

  return (
    <section
      aria-label={t('a11y')}
      className="relative border-y border-mist-500/10 bg-night-900/60 backdrop-blur-sm"
    >
      <Container className="!max-w-none !px-0">
        <div className="flex h-12 items-stretch sm:h-[3.25rem]">
          {/* Sticky label cap — stays put while the tape streams past it. */}
          <div className="z-10 flex shrink-0 items-center gap-2 border-r border-mist-500/10 bg-night-900/85 px-3.5 sm:gap-2.5 sm:px-6">
            <span className="relative inline-flex h-2 w-2" aria-hidden>
              <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-led-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-led-400" />
            </span>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-mist-100">
              {t('label')}
            </span>
            <span className="inline-flex rounded-pill border border-volt-400/25 bg-volt-500/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-volt-300">
              {t('tag')}
            </span>
          </div>

          {/* Tape viewport — edges dissolve so chips emerge and vanish, not clip. */}
          <div
            className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]"
          >
            <div className="animate-marquee flex w-max items-center hover:[animation-play-state:paused]">
              <MarketRow labels={labels} />
              <MarketRow labels={labels} hidden />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
