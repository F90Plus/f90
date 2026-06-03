import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware navigation helpers. ALWAYS import `Link`, `useRouter`,
 * `usePathname` and `redirect` from here instead of `next/navigation` so that
 * locale prefixes are handled automatically.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
