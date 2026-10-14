/**
 * Page gallery logic (pure, no DOM globals). Collage cuts and figure images are
 * links carrying `data-gallery-*` attributes; the viewer collects them in
 * document order, steps through them with wrap-around and reads swipes.
 */

/** Every inspectable image on the page; `data-gallery-full` is the large variant. */
export const GALLERY_SELECTOR = '[data-gallery-full]';

/** Widths offered for the large variant; the original width caps them (no upscaling). */
export const FULL_STEPS = [640, 1024, 1600, 2400];

export interface GalleryItem {
  src: string;
  srcset: string;
  thumb: string;
  alt: string;
  label: string;
  caption: string;
  figure: string;
  width: number;
  height: number;
}

export type Direction = 'next' | 'prev';

/** Keeps an index inside `0..n-1`, wrapping in both directions. */
export function wrapIndex(i: number, n: number): number {
  if (n <= 0) return 0;
  return ((i % n) + n) % n;
}

/**
 * A finished pointer movement as a swipe: horizontal travel of at least
 * `threshold` px that clearly dominates the vertical travel. Leftward = next.
 */
export function swipeDirection(
  dx: number,
  dy: number,
  { threshold = 48, dominance = 1.5 }: { threshold?: number; dominance?: number } = {},
): Direction | null {
  if (Math.abs(dx) < threshold) return null;
  if (Math.abs(dx) < Math.abs(dy) * dominance) return null;
  return dx < 0 ? 'next' : 'prev';
}

const pad = (v: number) => String(v).padStart(2, '0');

/** "03 / 07" */
export function counterLabel(i: number, n: number): string {
  return `${pad(i + 1)} / ${pad(n)}`;
}

/** srcset widths for the large variant of an image `original` px wide. */
export function fullWidths(original: number, steps: number[] = FULL_STEPS): number[] {
  const max = steps[steps.length - 1];
  const below = steps.filter((w) => w < Math.min(original, max));
  return [...below, Math.min(original, max)];
}

type Data = Record<string, string | undefined>;

/** Reads one trigger's dataset; null when it has no image. */
export function readItem(data: Data): GalleryItem | null {
  const src = data.galleryFull;
  if (!src) return null;
  return {
    src,
    srcset: data.galleryFullset ?? '',
    thumb: data.galleryThumb || src,
    alt: data.galleryAlt ?? '',
    label: data.galleryLabel ?? '',
    caption: data.galleryCaption ?? '',
    figure: data.galleryFigure ?? '',
    width: Number(data.galleryWidth) || 0,
    height: Number(data.galleryHeight) || 0,
  };
}

interface Trigger {
  dataset: Data;
}

/** All gallery items under `root` in document order, with the element each came from. */
export function collectItems<T extends Trigger>(root: {
  querySelectorAll(selector: string): Iterable<T> | ArrayLike<T>;
}): { items: GalleryItem[]; triggers: T[] } {
  const items: GalleryItem[] = [];
  const triggers: T[] = [];
  for (const el of Array.from(root.querySelectorAll(GALLERY_SELECTOR))) {
    const item = readItem(el.dataset);
    if (!item) continue;
    items.push(item);
    triggers.push(el);
  }
  return { items, triggers };
}
