'use client';

import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type UserMenuLabels = {
  menu: string;
  signedInAs: string;
  home: string;
  predictions: string;
  ranking: string;
  profile: string;
  settings: string;
  signOut: string;
};

/**
 * Compact signed-in control: an avatar disc that opens a small menu with the
 * account email, quick links to the authenticated surfaces (home · predictions ·
 * ranking · public profile · settings) and a sign-out form. On mobile — where the
 * header's route nav is hidden — this menu is the full authenticated nav graph, so
 * every core surface stays reachable in the thumb zone. `signOutAction` is a server
 * action already bound to the active locale by the (server) Header; the links are
 * locale-aware next-intl `Link`s, so this stays a thin client island — it only owns
 * open/close + dismissal.
 */
export function UserMenu({
  email,
  username,
  signOutAction,
  labels,
}: {
  email: string;
  /** Player handle for the public-profile link; empty hides that item. */
  username: string;
  signOutAction: () => Promise<void>;
  labels: UserMenuLabels;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const initial = (email.trim()[0] ?? '?').toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const itemClass =
    'block rounded-pill px-4 py-2 text-sm font-medium text-mist-200 transition-colors hover:bg-night-800/70 hover:text-white';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={labels.menu}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-pill border border-led-400/30 bg-night-800/70',
          'font-display text-sm font-bold text-led-200 transition-colors hover:border-led-400/60 hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-led-400/60',
        )}
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="glass hairline absolute right-0 top-11 z-50 w-60 rounded-card p-3 shadow-xl"
        >
          <p className="px-1 text-[0.7rem] uppercase tracking-wider text-mist-500">
            {labels.signedInAs}
          </p>
          <p className="mt-0.5 truncate px-1 text-sm font-medium text-mist-100" title={email}>
            {email}
          </p>

          <div aria-hidden className="my-2 h-px bg-mist-500/10" />

          <Link href="/home" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            {labels.home}
          </Link>
          <Link href="/predictions" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            {labels.predictions}
          </Link>
          <Link href="/ranking" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            {labels.ranking}
          </Link>
          {username ? (
            <Link
              href={`/u/${username}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              {labels.profile}
            </Link>
          ) : null}
          <Link href="/settings" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            {labels.settings}
          </Link>

          <div aria-hidden className="my-2 h-px bg-mist-500/10" />

          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="w-full rounded-pill border border-mist-500/15 px-4 py-2 text-sm font-medium text-mist-200 transition-colors hover:border-flare-500/40 hover:bg-flare-500/10 hover:text-flare-300"
            >
              {labels.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
