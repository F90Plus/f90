import Image from 'next/image';
import { cn } from '@/lib/utils';

const BLEND = {
  normal: '',
  screen: 'mix-blend-screen',
  overlay: 'mix-blend-overlay',
  'soft-light': 'mix-blend-soft-light',
} as const;

interface CinematicImageLayerProps {
  src: string;
  /** Positioning + size of the layer (must be positioned for `fill`). */
  className?: string;
  /** Extra classes on the image itself (opacity, object-position, masks). */
  imageClassName?: string;
  blend?: keyof typeof BLEND;
  priority?: boolean;
  sizes?: string;
}

/**
 * A composable, treated image layer for cinematic atmosphere. Any image (generated
 * bokeh, or a real dark stadium photo) drops in here and is integrated via blend
 * mode + opacity + masks (set by the caller) — never a "pasted wallpaper".
 * Uses next/image (optimized, responsive). Decorative (aria-hidden).
 */
export function CinematicImageLayer({
  src,
  className,
  imageClassName,
  blend = 'normal',
  priority = false,
  sizes = '100vw',
}: CinematicImageLayerProps) {
  return (
    <div aria-hidden="true" className={cn('pointer-events-none overflow-hidden', className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover select-none', BLEND[blend], imageClassName)}
      />
    </div>
  );
}
