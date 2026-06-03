/** Mock global leaderboard for the homepage teaser. Real standings come later. */

export interface LeaderboardEntry {
  rank: number;
  alias: string;
  accent: string; // hex for the player token gradient
  points: number;
}

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, alias: 'laMáquina', accent: '#FFC44D', points: 12480 },
  { rank: 2, alias: 'TikiTaka_99', accent: '#3D74FF', points: 11920 },
  { rank: 3, alias: 'ElProfe', accent: '#2FE6A0', points: 11510 },
  { rank: 4, alias: 'golazo_kid', accent: '#FF8A3D', points: 10880 },
  { rank: 5, alias: 'panenka.io', accent: '#74ACE6', points: 10440 },
];
