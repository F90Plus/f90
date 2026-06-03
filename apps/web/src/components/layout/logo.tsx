import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Rendered height in px (width derived from the render's aspect ratio). */
  height?: number;
  /** Add the signature gold/lime halo behind the logo (for dark surfaces). */
  glow?: boolean | 'lg';
  priority?: boolean;
  className?: string;
  /** Wrap in a home link. Pass `null` to render the image alone. */
  href?: string | null;
}

/**
 * The F90+ logo — the official render is the primary identity everywhere it's
 * visible. Size with `height`; add the original glow with `glow`.
 */
export function Logo({ height = 36, glow = false, priority, className, href = '/' }: LogoProps) {
  const width = Math.round((BRAND.logo.width / BRAND.logo.height) * height);

  const image = (
    <Image
      src={BRAND.logo.src}
      alt={BRAND.logo.alt}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      className={cn(
        'h-auto w-auto select-none',
        glow === 'lg' ? 'logo-glow-lg' : glow ? 'logo-glow' : null,
        className,
      )}
      style={{ height, width }}
    />
  );

  if (href === null) return image;

  return (
    <Link href={href} aria-label={BRAND.name} className="inline-flex shrink-0">
      {image}
    </Link>
  );
}
