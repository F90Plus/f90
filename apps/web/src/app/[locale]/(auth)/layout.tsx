import type { ReactNode } from 'react';

/**
 * Auth chrome — centers the panel in the viewport (minus the sticky header) over
 * the shared stadium-night backdrop from the root layout. Pages: /login, /signup.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 py-16 sm:py-20">
      {children}
    </div>
  );
}
