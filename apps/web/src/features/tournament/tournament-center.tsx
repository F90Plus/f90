import { getTournament } from '@/lib/football/tournament';
import { favourites } from '@/lib/football/analysis';
import { FieldIsSet } from './field-is-set';
import { QualifiedNations } from './qualified-nations';
import { GroupsGrid } from './groups-grid';
import { BracketBand } from './bracket-band';
import { KeyMatches } from './key-matches';

/**
 * The Tournament Center — the live, premium World Cup band that makes F90+ feel
 * alive before a single user registers. One cache-first openfootball read fans out
 * into the field, the draw, the road (bracket) and the key matches. On source
 * failure it degrades honestly: render nothing rather than empty scaffolding.
 */
export async function TournamentCenter() {
  const tournament = await getTournament();
  if (tournament.meta.source === 'fallback') return null;

  const favs = favourites(tournament.groups, 4);

  return (
    <>
      <FieldIsSet meta={tournament.meta} />
      <QualifiedNations groups={tournament.groups} />
      <GroupsGrid groups={tournament.groups} />
      <BracketBand bracket={tournament.bracket} favourites={favs} />
      <KeyMatches matches={tournament.keyMatches} />
    </>
  );
}
