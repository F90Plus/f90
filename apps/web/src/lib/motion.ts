import type { Variants } from 'framer-motion';

/**
 * Shared Framer Motion variants. Keeping the motion language in one place makes
 * entrances feel consistent across the product (and easy to retune globally).
 * All easing uses the same "broadcast ease-out" curve.
 */
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: EASE_OUT } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

/** Parent container that staggers its children's entrances. */
export const staggerParent = (stagger = 0.09, delayChildren = 0.04): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

/** Reusable `whileInView` viewport config — animate once, when ~25% visible. */
export const viewportOnce = { once: true, amount: 0.25 } as const;
