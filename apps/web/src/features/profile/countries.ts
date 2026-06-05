import { createClient } from '@/lib/supabase/server';
import { flagAssetFor } from '@/lib/football/flags';

/** A country offered in the onboarding picker — name already localized. */
export interface OnboardingCountry {
  code: string;
  name: string;
  /** Vendored flag asset, or null → the UI falls back to an accent code token. */
  flag: string | null;
  accent: string;
  isHost: boolean;
}

/**
 * The 48 qualified nations from the `countries` seed (T3), localized and sorted
 * by display name. Flags resolve through `flagAssetFor` (keyed by the English
 * name, like the tournament UI) — NOT the 3-letter code — and fall back to the
 * accent token when missing. `countries` is world-readable (RLS), so this works
 * pre-auth too.
 */
export async function getCountries(locale: string): Promise<OnboardingCountry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('countries')
    .select('code, name_en, name_es, is_host, accent_color')
    .eq('is_qualified', true);

  if (!data) return [];

  return data
    .map((c) => ({
      code: c.code,
      name: locale === 'es' ? c.name_es : c.name_en,
      flag: flagAssetFor(c.name_en),
      accent: c.accent_color,
      isHost: c.is_host,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}
