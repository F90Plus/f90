import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { buttonVariants } from '@/components/ui/button';
import { NAV_LINKS, PLAY_HREF } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { LocaleSwitcher } from './locale-switcher';

/** Sticky broadcast top bar. */
export function Header() {
  const t = useTranslations('nav');

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
