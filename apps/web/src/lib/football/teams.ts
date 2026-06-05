/**
 * Team metadata keyed by openfootball's exact team-name strings.
 * `code` = 3-letter broadcast code, `accent` = token-aligned hex for the team
 * token, `strength` = internal rating (FIFA-ranking proxy) feeding the model.
 * Covers all 48 nations of the 2026 field; unmapped teams degrade gracefully
 * via `teamMeta()`. Ordered by strength (descending) for readability.
 */
export interface TeamMeta {
  code: string;
  accent: string;
  strength: number;
}

export const TEAMS: Record<string, TeamMeta> = {
  Spain: { code: 'ESP', accent: '#E63946', strength: 2090 },
  Argentina: { code: 'ARG', accent: '#74ACE6', strength: 2080 },
  France: { code: 'FRA', accent: '#3D74FF', strength: 2050 },
  Brazil: { code: 'BRA', accent: '#EFC400', strength: 2050 },
  England: { code: 'ENG', accent: '#5B8CFF', strength: 2010 },
  Portugal: { code: 'POR', accent: '#1FA85C', strength: 2000 },
  Netherlands: { code: 'NED', accent: '#FF8A3D', strength: 1990 },
  Germany: { code: 'GER', accent: '#E8B500', strength: 1980 },
  Belgium: { code: 'BEL', accent: '#E8B500', strength: 1970 },
  Colombia: { code: 'COL', accent: '#EFC400', strength: 1950 },
  Uruguay: { code: 'URU', accent: '#74ACE6', strength: 1930 },
  Croatia: { code: 'CRO', accent: '#E63946', strength: 1920 },
  Morocco: { code: 'MAR', accent: '#C0392B', strength: 1900 },
  Japan: { code: 'JPN', accent: '#E6486A', strength: 1880 },
  Switzerland: { code: 'SUI', accent: '#E63946', strength: 1865 },
  'Ivory Coast': { code: 'CIV', accent: '#FF8A3D', strength: 1860 },
  Ecuador: { code: 'ECU', accent: '#EFC400', strength: 1860 },
  Senegal: { code: 'SEN', accent: '#1FA85C', strength: 1860 },
  Sweden: { code: 'SWE', accent: '#5B8CFF', strength: 1855 },
  USA: { code: 'USA', accent: '#5B8CFF', strength: 1850 },
  Turkey: { code: 'TUR', accent: '#E63946', strength: 1850 },
  Norway: { code: 'NOR', accent: '#C8102E', strength: 1845 },
  Mexico: { code: 'MEX', accent: '#15D389', strength: 1835 },
  Iran: { code: 'IRN', accent: '#1FA85C', strength: 1830 },
  'South Korea': { code: 'KOR', accent: '#3D74FF', strength: 1825 },
  'Czech Republic': { code: 'CZE', accent: '#5B8CFF', strength: 1820 },
  Egypt: { code: 'EGY', accent: '#C0392B', strength: 1820 },
  Austria: { code: 'AUT', accent: '#ED2939', strength: 1820 },
  Canada: { code: 'CAN', accent: '#E63946', strength: 1810 },
  Scotland: { code: 'SCO', accent: '#3D74FF', strength: 1800 },
  Paraguay: { code: 'PAR', accent: '#E63946', strength: 1795 },
  Algeria: { code: 'ALG', accent: '#0B7A3E', strength: 1795 },
  Tunisia: { code: 'TUN', accent: '#C0392B', strength: 1790 },
  'Bosnia & Herzegovina': { code: 'BIH', accent: '#3D74FF', strength: 1785 },
  Ghana: { code: 'GHA', accent: '#CE1126', strength: 1775 },
  Australia: { code: 'AUS', accent: '#EFC400', strength: 1765 },
  'DR Congo': { code: 'COD', accent: '#3DA0E6', strength: 1760 },
  'Saudi Arabia': { code: 'KSA', accent: '#15803D', strength: 1740 },
  Uzbekistan: { code: 'UZB', accent: '#3D74FF', strength: 1720 },
  Iraq: { code: 'IRQ', accent: '#1FA85C', strength: 1710 },
  Qatar: { code: 'QAT', accent: '#7A1F3D', strength: 1705 },
  'South Africa': { code: 'RSA', accent: '#1FA85C', strength: 1700 },
  Jordan: { code: 'JOR', accent: '#C8102E', strength: 1700 },
  Panama: { code: 'PAN', accent: '#DA121A', strength: 1690 },
  'New Zealand': { code: 'NZL', accent: '#5B8CFF', strength: 1655 },
  'Cape Verde': { code: 'CPV', accent: '#1FA85C', strength: 1650 },
  'Curaçao': { code: 'CUW', accent: '#3D74FF', strength: 1610 },
  Haiti: { code: 'HAI', accent: '#5B8CFF', strength: 1560 },
};

/** Derive a stable code for an unmapped team (fallback). */
function deriveCode(name: string): string {
  const letters = name.replace(/[^A-Za-z]/g, '');
  return (letters.slice(0, 3) || 'TBD').toUpperCase();
}

export function teamMeta(name: string): TeamMeta {
  return TEAMS[name] ?? { code: deriveCode(name), accent: '#828FB2', strength: 1740 };
}

/** Reverse index: 3-letter broadcast code → openfootball team name. */
const CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(TEAMS).map(([name, meta]) => [meta.code, name]),
);

/**
 * Resolve a 3-letter broadcast code (e.g. fixtures' `home_code`/`away_code`) back
 * to its canonical openfootball team name, or `null` if unknown. Bridges the
 * code-keyed fixture data to the name-keyed flag/metadata helpers.
 */
export function teamNameForCode(code: string): string | null {
  return CODE_TO_NAME[code.toUpperCase()] ?? null;
}
