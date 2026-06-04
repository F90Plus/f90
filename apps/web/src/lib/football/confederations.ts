/**
 * Confederation membership for every nation in the 2026 field. FACTUAL reference
 * data (FIFA confederation membership — like country→continent), keyed by
 * openfootball's exact name strings. Powers the Qualified Nations filter and the
 * "field is set" breakdown. Never invented — membership is public record.
 */
export type Confederation = 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | 'AFC' | 'OFC';

/** Display order for the filter (acronyms are universal — no translation needed). */
export const CONFEDERATIONS: { id: Confederation; label: string }[] = [
  { id: 'UEFA', label: 'UEFA' },
  { id: 'CONMEBOL', label: 'CONMEBOL' },
  { id: 'CONCACAF', label: 'CONCACAF' },
  { id: 'CAF', label: 'CAF' },
  { id: 'AFC', label: 'AFC' },
  { id: 'OFC', label: 'OFC' },
];

export const CONFEDERATION_BY_NATION: Record<string, Confederation> = {
  // UEFA — Europe (16)
  Spain: 'UEFA',
  France: 'UEFA',
  England: 'UEFA',
  Portugal: 'UEFA',
  Netherlands: 'UEFA',
  Germany: 'UEFA',
  Belgium: 'UEFA',
  Croatia: 'UEFA',
  Switzerland: 'UEFA',
  Sweden: 'UEFA',
  Turkey: 'UEFA',
  'Czech Republic': 'UEFA',
  Scotland: 'UEFA',
  'Bosnia & Herzegovina': 'UEFA',
  Austria: 'UEFA',
  Norway: 'UEFA',
  // CONMEBOL — South America (6)
  Argentina: 'CONMEBOL',
  Brazil: 'CONMEBOL',
  Colombia: 'CONMEBOL',
  Uruguay: 'CONMEBOL',
  Ecuador: 'CONMEBOL',
  Paraguay: 'CONMEBOL',
  // CONCACAF — North/Central America & Caribbean (6)
  Mexico: 'CONCACAF',
  USA: 'CONCACAF',
  Canada: 'CONCACAF',
  Panama: 'CONCACAF',
  Haiti: 'CONCACAF',
  'Curaçao': 'CONCACAF',
  // CAF — Africa (10)
  Morocco: 'CAF',
  Egypt: 'CAF',
  Tunisia: 'CAF',
  Senegal: 'CAF',
  Ghana: 'CAF',
  Algeria: 'CAF',
  'Ivory Coast': 'CAF',
  'South Africa': 'CAF',
  'Cape Verde': 'CAF',
  'DR Congo': 'CAF',
  // AFC — Asia & Australia (9)
  Japan: 'AFC',
  Iran: 'AFC',
  'South Korea': 'AFC',
  Australia: 'AFC',
  'Saudi Arabia': 'AFC',
  Qatar: 'AFC',
  Uzbekistan: 'AFC',
  Jordan: 'AFC',
  Iraq: 'AFC',
  // OFC — Oceania (1)
  'New Zealand': 'OFC',
};

export function confederationOf(name: string): Confederation | null {
  return CONFEDERATION_BY_NATION[name] ?? null;
}
