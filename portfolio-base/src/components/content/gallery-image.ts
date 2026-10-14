/**
 * Build-time data for an inspectable image: the large optimized variant (link
 * target without JS, srcset for the viewer), a small thumbnail and the text
 * the viewer shows. Spread the result onto the trigger link.
 */
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { fullWidths } from '../../lib/gallery';

interface Text {
  alt: string;
  label?: string;
  caption?: string;
  figure?: string;
}

export async function galleryAttrs(src: ImageMetadata, text: Text) {
  const widths = fullWidths(src.width);
  const largest = widths[widths.length - 1];
  const [full, set, thumb] = await Promise.all([
    getImage({ src, width: largest, format: 'webp' }),
    getImage({ src, widths, format: 'webp' }),
    getImage({ src, width: 192, format: 'webp' }),
  ]);
  return {
    href: full.src,
    'data-gallery-full': full.src,
    'data-gallery-fullset': set.srcSet.attribute,
    'data-gallery-thumb': thumb.src,
    'data-gallery-alt': text.alt,
    'data-gallery-label': text.label ?? '',
    'data-gallery-caption': text.caption ?? '',
    'data-gallery-figure': text.figure ?? '',
    'data-gallery-width': String(largest),
    'data-gallery-height': String(Math.round((largest / src.width) * src.height)),
  };
}
