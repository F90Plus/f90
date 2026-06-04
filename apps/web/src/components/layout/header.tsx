import { getLocale, getTranslations } from 'next-intl/server';
import { Container } from '@/components/ui/container';
import { buttonVariants } from '@/components/ui/button';
import { NAV_LINKS, PLAY_HREF } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { getCurrentUser } from '@/lib/supabase/server';
import { signOut } from '@/features/auth/actions';
import { Link } from '@/i18n/navigation';
import { Logo } from './logo';
import { LocaleSwitcher } from './locale-switcher';
import { UserMenu } from './user-menu';

/** Sticky broadcast top bar. Auth-aware: a sign-in CTA when signed out, a
 *  compact account menu when signed in (verified server-side via getCurrentUser). */
export async function Header() {
  const [t, tAuth, locale, user] = await Promise.all([
    getTranslations('nav'),
    getTranslations('auth'),
    getLocale(),
    getCurrentUser(),
  ]);

  return (
    <header className="sticky top-0 z-50 border-b border-mist-500/10 bg-night-950/70 backdrop-blur-xl">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo height={38} priority />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
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
              signOutAction={signOut.bind(null, locale)}
              labels={{
                menu: tAuth('account.menu'),
                signedInAs: tAuth('account.signedInAs'),
                signOut: tAuth('account.signOut'),
              }}
            />
          ) : (
            <Link href="/login" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
              {tAuth('account.signIn')}
            </Link>
          )}

          <a
            href={PLAY_HREF}
            className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:inline-flex')}
          >
            {t('play')}
          </a>
        </div>
      </Container>
    </header>
  );
}
