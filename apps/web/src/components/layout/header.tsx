import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { buttonVariants } from '@/components/ui/button';
import { APP_NAV_LINKS, NAV_LINKS, PLAY_HREF } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { signOut } from '@/features/auth/actions';
import { Link } from '@/i18n/navigation';
import { Logo } from './logo';
import { LocaleSwitcher } from './locale-switcher';
import { UserMenu } from './user-menu';

/** Sticky broadcast top bar. Auth-aware: signed-out shows the landing nav +
 *  sign-in CTA; signed-in shows the real in-app routes + a compact account menu
 *  (verified server-side via getCurrentUser, so the nav never dead-ends on a
 *  landing-only anchor). */
export async function Header() {
  const [t, tAuth, locale, user] = await Promise.all([
    getTranslations('nav'),
    getTranslations('auth'),
    getLocale(),
    getCurrentUser(),
  ]);

  // Signed-in: resolve the handle so the account menu can link to the public
  // profile. One light read; skipped entirely for signed-out visitors.
  let username = '';
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase.from('profiles').select('username').eq('id', user.id).single();
    username = (data as { username: string } | null)?.username ?? '';
  }

  return (
    <header className="sticky top-0 z-50 border-b border-mist-500/10 bg-night-950/70 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        {/* Brand: the official F90+ render with its signature gold/lime halo —
            a deliberate, premium presence on the dark broadcast bar (founder tweak #2).
            Signed-in, it returns the user to /home (their hub), not the marketing root. */}
        <Logo height={40} glow priority href={user ? '/home' : '/'} />

        <nav className="hidden items-center gap-8 md:flex">
          {user
            ? APP_NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="text-sm text-mist-300 transition-colors hover:text-white"
                >
                  {t(link.key)}
                </Link>
              ))
            : NAV_LINKS.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="text-sm text-mist-300 transition-colors hover:text-white"
                >
                  {t(link.key)}
                </a>
              ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />

          {user ? (
            <UserMenu
              email={user.email ?? ''}
              username={username}
              signOutAction={signOut.bind(null, locale)}
              labels={{
                menu: tAuth('account.menu'),
                signedInAs: tAuth('account.signedInAs'),
                home: tAuth('account.home'),
                predictions: tAuth('account.predictions'),
                ranking: tAuth('account.ranking'),
                profile: tAuth('account.profile'),
                settings: tAuth('account.settings'),
                signOut: tAuth('account.signOut'),
              }}
            />
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                {tAuth('account.signIn')}
              </Link>
              <a
                href={PLAY_HREF}
                className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:inline-flex')}
              >
                {t('play')}
              </a>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
