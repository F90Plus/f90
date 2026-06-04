import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/** The Analyst's voice, woven through the Tournament Center — a small attributed read. */
export function AnalystNote({ children, className }: { children: ReactNode; className?: string }) {
  const t = useTranslations('copilot');
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border border-led-500/20 bg-led-500/5 px-4 py-3',
        className,
      )}
    >
      <span className="mt-0.5 flex shrink-0 items-center gap-1.5">
        <span className="animate-live-pulse h-1.5 w-1.5 rounded-full bg-led-400" />
        <span className="font-display text-[0.7rem] font-bold uppercase tracking-wider text-led-300">
          {t('name')}
        </span>
      </span>
      <p className="text-sm text-mist-200">{children}</p>
    </div>
  );
}
