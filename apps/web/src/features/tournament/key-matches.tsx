import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { insightFromStrengths } from '@/lib/copilot';
import { homeAdvantageFor } from '@/lib/football/model';
import type { HomeMatch } from '@/lib/football/types';
import { MatchCard } from '@/features/home/match-card';
import { MarketCard } from '@/features/markets/market-card';
import { AnalystCard } from '@/features/copilot/analyst-card';
import { markets, type Market } from '@/data/markets';

type GridItem = { kind: 'market'; market: Market } | { kind: 'fixture'; match: HomeMatch };

// The Analyst Center as a live market: the marquee tie is read in full by the
// Analyst (hero), and the grid is ONE surface mixing World Cup outcome markets
// (selecciones · jugadores · narrativa — quick-chip action) with the supporting
// fixtures as 1X2 markets (single "take a position" CTA). Server component: the
// engine runs server-side, so it never enters the client bundle.
const GRID_MARKET_SUBJECTS = ['España', 'Mbappé', 'Argentina', 'Mundial 2026'];

export function KeyMatches({ matches }: { matches: HomeMatch[] }) {
  const t = useTranslations('tournament.key');

  if (matches.length === 0) return null;
  const [opener, ...rest] = matches;
  const insight = opener
    ? insightFromStrengths({
        fixtureId: opener.id,
        home: { code: opener.home.code, name: opener.home.name },
        away: { code: opener.away.code, name: opener.away.name },
        homeStrength: opener.home.strength,
        awayStrength: opener.away.strength,
        homeAdvantage: homeAdvantageFor(opener.home.name),
      })
    : null;

  const gridMarkets = markets.filter((m) => GRID_MARKET_SUBJECTS.includes(m.subject));
  const fixtures = rest.slice(0, 2);

  // Interleave for variety: market · market · fixture · market · market · fixture.
  const items: GridItem[] = [];
  const addMarket = (i: number) => {
    const m = gridMarkets[i];
    if (m) items.push({ kind: 'market', market: m });
  };
  const addFixture = (i: number) => {
    const fx = fixtures[i];
    if (fx) items.push({ kind: 'fixture', match: fx });
  };
  addMarket(0);
  addMarket(1);
  addFixture(0);
  addMarket(2);
  addMarket(3);
  addFixture(1);

  return (
    <section id="analyst" className="relative scroll-mt-24 py-16 sm:py-24">
      <Container className="flex flex-col gap-10">
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />
        <div className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {insight ? <AnalystCard insight={insight} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((it) =>
              it.kind === 'market' ? (
                <MarketCard key={`m-${it.market.subject}-${it.market.q}`} market={it.market} />
              ) : (
                <MatchCard key={`f-${it.match.id}`} match={it.match} />
              ),
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
