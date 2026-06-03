import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { NAV_LINKS } from '@/lib/constants';
import { Logo } from './logo';

/** Site footer with the all-important "this is not gambling" disclaimer. */
export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-mist-500/10 bg-night-950">
      <Container className="flex flex-col gap-10 py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-sm flex-col gap-4">
            <Logo height={48} glow />
            <p className="text-sm text-mist-400">{t('footer.tagline')}</p>
            <Badge tone="free" className="w-fit">
              {t('common.free')}
            </Badge>
          </div>

          <nav className="flex flex-wrap gap-x-10 gap-y-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="text-sm text-mist-300 transition-colors hover:text-white"
              >
                {t(`nav.${link.key}`)}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-mist-500/10 pt-6 text-xs text-mist-500 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl leading-relaxed">{t('footer.disclaimer')}</p>
          <div className="flex items-center gap-4 whitespace-nowrap">
            <span>{t('footer.rights')}</span>
            <span className="nums">{t('footer.copyright', { year })}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
