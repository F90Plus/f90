import type { TournamentGroup, TournamentTeam } from './tournament';

/**
 * Light tournament analysis — the substrate for the Analyst's narrative layer.
 * All derived transparently from the same model strengths that power the match
 * insights (never invented): which group is the toughest draw, who the favourites are.
 */

/** Group "heat" — sum of the four sides' strengths. Higher = tougher draw. */
export function groupHeat(group: TournamentGroup): number {
  return group.teams.reduce((sum, team) => sum + team.strength, 0);
}

/** Id of the highest-heat group (the group of the death), or null for an empty field. */
export function toughestGroupId(groups: TournamentGroup[]): string | null {
  if (groups.length === 0) return null;
  return [...groups].sort((a, b) => groupHeat(b) - groupHeat(a))[0]!.id;
}

/** The Analyst's favourites — the strongest nations across the field, top n by strength. */
export function favourites(groups: TournamentGroup[], n = 4): TournamentTeam[] {
  return groups
    .flatMap((g) => g.teams)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, n);
}
