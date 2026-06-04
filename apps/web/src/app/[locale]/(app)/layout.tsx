import type { ReactNode } from 'react';
import { requireOnboardedUser } from '@/features/auth/guards';

/**
 * The authenticated app shell. Every route under `(app)/` is gated here: a
 * signed-out visitor is sent to login, a signed-in-but-not-onboarded user is sent
 * to onboarding. Pages below can assume a real, onboarded session.
 */
export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireOnboardedUser(locale);
  return <>{children}</>;
}
