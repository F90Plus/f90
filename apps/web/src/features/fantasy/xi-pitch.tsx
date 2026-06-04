'use client';

import { motion } from 'framer-motion';
import { useFormatter, useTranslations } from 'next-intl';
import { scaleIn, staggerParent, viewportOnce } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** Illustrative squad value in Tokens F90 — a preview number (D-034 "team value"). */
const SQUAD_VALUE = 248_600;

interface Slot {
  num: number;
  /** 0–100 position on the pitch (top = the attacking far goal). */
  x: number;
  y: number;
  /** Real nation accent — a World-Cup-flavoured XI (own IP, no names/crests, D-025). */
  accent: string;
  captain?: boolean;
}

// A 4-3-3 dream XI: a spread of real nations by colour, the No.9 as captain.
const XI: Slot[] = [
  { num: 11, x: 22, y: 31, accent: '#3D74FF' }, // FRA
  { num: 9, x: 50, y: 23, accent: '#74ACE6', captain: true }, // ARG · captain
  { num: 7, x: 78, y: 31, accent: '#EFC400' }, // BRA
  { num: 8, x: 26, y: 54, accent: '#5B8CFF' }, // ENG
  { num: 10, x: 50, y: 50, accent: '#1FA85C' }, // POR
  { num: 6, x: 74, y: 54, accent: '#E8B500' }, // GER
  { num: 2, x: 17, y: 76, accent: '#FF8A3D' }, // NED
  { num: 5, x: 39, y: 80, accent: '#E63946' }, // ESP
  { num: 4, x: 61, y: 80, accent: '#C0392B' }, // MAR
  { num: 3, x: 83, y: 76, accent: '#9B6BFF' }, // (neutral violet — depth)
  { num: 1, x: 50, y: 91, accent: '#15D389' }, // GK
];

const BENCH = [
  { num: 12, accent: '#5B8CFF' },
  { num: 13, accent: '#FF8A3D' },
  { num: 14, accent: '#1FA85C' },
  { num: 15, accent: '#E63946' },
];

/** Pick a legible number colour for a given token accent (perceived luminance). */
function readableOn(hex: string): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#05080f' : '#f6f8ff';
}

function PlayerToken({ slot }: { slot: Slot }) {
  const text = readableOn(slot.accent);
  return (
    <div
      className="absolute"
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <motion.div variants={scaleIn}>
        <span
          className={cn(
            'relative flex items-center justify-center rounded-full font-display font-extrabold ring-1',
            slot.captain
              ? 'glow-gold h-12 w-12 ring-gold-300 sm:h-[3.4rem] sm:w-[3.4rem]'
              : 'h-9 w-9 shadow-[0_7px_16px_-8px_rgba(0,0,0,0.85)] ring-white/15 sm:h-11 sm:w-11',
          )}
          style={{ background: `radial-gradient(120% 120% at 32% 26%, ${slot.accent}, ${slot.accent}cc)`, color: text }}
        >
          <span className="nums text-xs sm:text-sm">{slot.num}</span>
          {slot.captain ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-400 text-[0.55rem] font-extrabold text-night-950 ring-2 ring-night-950">
              C
            </span>
          ) : null}
        </span>
      </motion.div>
    </div>
  );
}

const LINE = 'rgba(233,238,251,0.14)';
const SPOT = 'rgba(233,238,251,0.22)';

/** Crisp top-down pitch markings — boundary, both boxes, arcs, centre + corners. */
function PitchMarkings() {
  return (
    <svg
      viewBox="0 0 300 400"
      preserveAspectRatio="none"
      fill="none"
      stroke={LINE}
      strokeWidth="1.5"
      aria-hidden
      className="absolute inset-0 h-full w-full"
      vectorEffect="non-scaling-stroke"
    >
      <rect x="8" y="8" width="284" height="384" rx="5" />
      <path d="M8 200 H292" />
      <circle cx="150" cy="200" r="32" />
      <circle cx="150" cy="200" r="2.6" fill={SPOT} stroke="none" />
      {/* far goal (attacking end) */}
      <rect x="78" y="8" width="144" height="52" />
      <rect x="120" y="8" width="60" height="20" />
      <circle cx="150" cy="42" r="2.6" fill={SPOT} stroke="none" />
      <path d="M126 60 Q150 78 174 60" />
      {/* near goal */}
      <rect x="78" y="340" width="144" height="52" />
      <rect x="120" y="372" width="60" height="20" />
      <circle cx="150" cy="358" r="2.6" fill={SPOT} stroke="none" />
      <path d="M126 340 Q150 322 174 340" />
      {/* corner arcs */}
      <path d="M8 18 Q8 8 18 8" />
      <path d="M282 8 Q292 8 292 18" />
      <path d="M8 382 Q8 392 18 392" />
      <path d="M282 392 Q292 392 292 382" />
    </svg>
  );
}

/**
 * The XI Ideal — an aspirational, broadcast-quality pitch that invites the user to
 * imagine the World Cup squad they'll build. Depth comes from light (far-end glow,
 * mow stripes, vignette) not an arcade 3D tilt; the eleven sit at real 4-3-3
 * positions, tinted by real nation colours, with the captain marked in gold. The
 * squad value (Tokens F90) makes it feel like a real team you're assembling.
 */
export function XiPitch() {
  const t = useTranslations('fantasy');
  const f = useFormatter();

  return (
    <div className="flex w-full max-w-[360px] flex-col gap-4">
      {/* header: XI title + formation */}
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-bold text-mist-100">{t('xiTitle')}</span>
        <span className="nums rounded-pill border border-mist-500/20 bg-night-800/60 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-mist-300">
          4-3-3
        </span>
      </div>

      {/* the pitch */}
      <motion.div
        variants={staggerParent(0.045)}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="pitch-field grain relative aspect-[3/4] w-full overflow-hidden rounded-2xl ring-1 ring-pitch-500/15"
      >
        <PitchMarkings />
        {XI.map((slot) => (
          <PlayerToken key={slot.num} slot={slot} />
        ))}
      </motion.div>

      {/* bench + squad value */}
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-wider text-mist-500">{t('bench')}</span>
          <div className="flex gap-1.5">
            {BENCH.map((b) => (
              <span
                key={b.num}
                className="nums flex h-7 w-7 items-center justify-center rounded-full text-[0.6rem] font-bold opacity-80 ring-1 ring-white/10"
                style={{ background: `linear-gradient(150deg, ${b.accent}, ${b.accent}99)`, color: readableOn(b.accent) }}
              >
                {b.num}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[0.6rem] uppercase tracking-wider text-mist-500">{t('teamValue')}</span>
          <span className="nums font-display text-sm font-bold text-lime-300">
            {f.number(SQUAD_VALUE)} <span className="font-medium text-mist-400">Tokens F90</span>
          </span>
        </div>
      </div>
    </div>
  );
}
