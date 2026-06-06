'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { LiveDot } from '@/components/ui/live-dot';
import { Eyebrow } from '@/components/ui/eyebrow';
import { WORLD_CUP_KICKOFF_ISO } from '@/lib/constants';

interface Remaining {
  done: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function remainingUntil(target: number): Remaining {
  const ms = Math.max(0, target - Date.now());
  const totalSeconds = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Live ticking countdown to the World Cup opener. */
export function Countdown() {
  const t = useTranslations('countdown');
  const target = new Date(WORLD_CUP_KICKOFF_ISO).getTime();
  // Client-only ticking value. It starts null so the server and the first client
  // paint render the same "--" placeholder (no hydration mismatch); the first real
  // value is written on the next tick — from a timer callback, never a synchronous
  // setState in the effect body — and then refreshed once per second.
  const [time, setTime] = useState<Remaining | null>(null);

  useEffect(() => {
    const sync = () => setTime(remainingUntil(target));
    const kick = window.setTimeout(sync, 0);
    const id = window.setInterval(sync, 1000);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(id);
    };
  }, [target]);

  if (time?.done) {
    return (
      <Card className="flex items-center gap-3 px-5 py-4">
        <LiveDot />
        <div>
          <p className="font-display font-bold text-flare-400">{t('live')}</p>
          <p className="text-sm text-mist-400">{t('liveSub')}</p>
        </div>
      </Card>
    );
  }

  const units = [
    { value: time?.days, label: t('days') },
    { value: time?.hours, label: t('hours') },
    { value: time?.minutes, label: t('minutes') },
    { value: time?.seconds, label: t('seconds') },
  ];

  return (
    <Card className="px-5 py-4">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <Eyebrow>{t('eyebrow')}</Eyebrow>
        <span className="text-sm text-mist-400">{t('label')}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center rounded-xl bg-night-900/60 py-3"
          >
            <span
              className="nums font-display text-2xl font-extrabold text-mist-50 sm:text-3xl"
              suppressHydrationWarning
            >
              {time ? String(unit.value).padStart(2, '0') : '--'}
            </span>
            <span className="mt-1 text-[0.65rem] uppercase tracking-widest text-mist-500">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-[0.65rem] tracking-[0.2em] text-mist-500 uppercase">
        {t('hosts')}
      </p>
    </Card>
  );
}
