import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { avatarColors, avatarInitial } from '@/lib/avatar';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'F90+ profile';

type Params = { params: Promise<{ locale: string; username: string }> };

/**
 * Per-user shareable OG card (D-031): the own-IP avatar gradient + handle + points
 * over the F90+ night surface. Localised (T10) — copy and number formatting follow
 * the requested locale. Inline styles only (Satori). Falls back to a generic F90+
 * card if the handle is unknown, so the route never errors.
 */
export default async function OpengraphImage({ params }: Params) {
  const { locale, username } = await params;
  const [tCommon, tProfile, supabase] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'profile' }),
    createClient(),
  ]);
  const { data } = await supabase
    .from('profiles')
    .select('username, display_name, total_points')
    .eq('username', username)
    .maybeSingle();

  const handle = (data?.username as string | undefined) ?? username;
  const name = (data?.display_name as string | null | undefined) || `@${handle}`;
  const points = (data?.total_points as number | undefined) ?? 0;
  const { from, to } = avatarColors(handle);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #080d1a 0%, #05080f 60%, #0b1120 100%)',
          padding: 72,
          color: '#e9eefb',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 800, letterSpacing: -1, color: '#aef23a' }}>
            F90+
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#828fb2' }}>{tCommon('worldCup')}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 180,
              height: 180,
              borderRadius: 180,
              background: `linear-gradient(140deg, ${from}, ${to})`,
              color: '#05080f',
              fontSize: 88,
              fontWeight: 800,
            }}
          >
            {avatarInitial(handle)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 48 }}>
            <div style={{ display: 'flex', fontSize: 64, fontWeight: 800, letterSpacing: -1.5 }}>
              {name}
            </div>
            <div style={{ display: 'flex', fontSize: 34, color: '#828fb2', marginTop: 8 }}>
              @{handle}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 56, fontWeight: 800, color: '#d2ff7a' }}>
              {new Intl.NumberFormat(locale).format(points)}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                color: '#5e6a8c',
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              {tProfile('pointsLabel')}
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#828fb2' }}>
            {tProfile('ogTagline')}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
