import { describe, expect, it } from 'vitest';
import { favourites, groupHeat, toughestGroupId } from '../analysis';
import { type TournamentGroup, toTournamentTeam } from '../tournament';

const group = (id: string, names: string[]): TournamentGroup => ({
  id,
  label: `Group ${id}`,
  teams: names.map(toTournamentTeam),
});

const GROUP_A = group('A', ['Mexico', 'South Africa', 'South Korea', 'Czech Republic']);
const GROUP_H = group('H', ['Spain', 'Cape Verde', 'Saudi Arabia', 'Uruguay']); // Spain 2090 + Uruguay 1930
const GROUP_B = group('B', ['Canada', 'Bosnia & Herzegovina', 'Qatar', 'Switzerland']);
const FIELD = [GROUP_A, GROUP_H, GROUP_B];

describe('groupHeat', () => {
  it('sums the four sides strengths', () => {
    // Canada 1810 + Bosnia 1785 + Qatar 1705 + Switzerland 1865
    expect(groupHeat(GROUP_B)).toBe(1810 + 1785 + 1705 + 1865);
  });
});

describe('toughestGroupId', () => {
  it('picks the highest-heat group as the group of the death', () => {
    expect(toughestGroupId(FIELD)).toBe('H');
  });

  it('returns null for an empty field', () => {
    expect(toughestGroupId([])).toBeNull();
  });
});

describe('favourites', () => {
  it('ranks the field by model strength', () => {
    const names = favourites(FIELD, 3).map((t) => t.name);
    expect(names[0]).toBe('Spain'); // 2090, strongest on the board
    expect(names).toHaveLength(3);
  });

  it('is empty for an empty field', () => {
    expect(favourites([], 4)).toHaveLength(0);
  });
});
