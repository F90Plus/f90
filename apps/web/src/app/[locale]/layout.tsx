import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Space_Grotesk } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AmbientBackdrop } from '@/components/atmosphere/ambient-backdrop';
import { cn } from '@/lib/utils';
import { BRAND } from '@/lib/brand';
import '@/styles/globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

type LocaleParams = { locale: string };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://f90.xyz';
  const path = locale === routing.defaultLocale ? '/' : `/${locale}`;

  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL(base),
    alternates: {
      canonical: path,
      languages: { es: '/', en: '/en', 'x-default': '/' },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      siteName: 'F90+',
      url: path,
      locale: locale === 'es' ? 'es_ES' : 'en_US',
      alternateLocale: locale === 'es' ? 'en_US' : 'es_ES',
      images: [{ url: BRAND.og, width: 1200, height: 630, alt: 'F90+' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [BRAND.og],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<LocaleParams>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering for this locale.
  setRequestLocale(locale);
  const [messages, tCommon] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <html
      lang={locale}
      className={cn(GeistSans.variable, GeistMono.variable, spaceGrotesk.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <AmbientBackdrop />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen flex-col">
            <a
              href="#main-content"
              className="sr-only rounded-pill bg-led-500 px-4 py-2 font-display text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:shadow-lg"
            >
              {tCommon('skipToContent')}
            </a>
            <Header />
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
