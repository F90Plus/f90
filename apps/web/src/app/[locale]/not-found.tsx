import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/components/layout/logo';

export default function NotFound() {
  const t = useTranslations('common');

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-7 text-center">
      <Logo height={104} glow="lg" href={null} />
      <span className="nums font-display text-6xl font-extrabold text-gradient">404</span>
      <Link href="/" className={buttonVariants({ variant: 'secondary' })}>
        {t('backHome')}
      </Link>
    </Container>
  );
}
