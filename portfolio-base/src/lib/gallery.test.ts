import { describe, expect, it } from 'vitest';
import {
  GALLERY_SELECTOR,
  collectItems,
  counterLabel,
  fullWidths,
  readItem,
  swipeDirection,
  wrapIndex,
} from './gallery';

describe('wrapIndex', () => {
  it('keeps an index inside the gallery', () => {
    expect(wrapIndex(2, 5)).toBe(2);
  });

  it('wraps past the last item to the first and before the first to the last', () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(-6, 5)).toBe(4);
    expect(wrapIndex(12, 5)).toBe(2);
  });

  it('returns 0 for an empty gallery', () => {
    expect(wrapIndex(3, 0)).toBe(0);
  });
});

describe('swipeDirection', () => {
  it('reads a leftward swipe as next and a rightward swipe as previous', () => {
    expect(swipeDirection(-80, 6)).toBe('next');
    expect(swipeDirection(80, -6)).toBe('prev');
  });

  it('ignores movements shorter than the threshold', () => {
    expect(swipeDirection(-30, 0)).toBeNull();
    expect(swipeDirection(-30, 0, { threshold: 24 })).toBe('next');
  });

  it('ignores mostly vertical movements', () => {
    expect(swipeDirection(-70, 60)).toBeNull();
    expect(swipeDirection(10, 200)).toBeNull();
  });
});

describe('counterLabel', () => {
  it('pads position and total to two digits', () => {
    expect(counterLabel(0, 7)).toBe('01 / 07');
    expect(counterLabel(11, 12)).toBe('12 / 12');
  });
});

describe('fullWidths', () => {
  it('never upscales: keeps steps below the original and adds the original width', () => {
    expect(fullWidths(1000)).toEqual([640, 1000]);
    expect(fullWidths(500)).toEqual([500]);
    expect(fullWidths(1024)).toEqual([640, 1024]);
  });

  it('caps very large originals at the largest step', () => {
    expect(fullWidths(4000)).toEqual([640, 1024, 1600, 2400]);
  });
});

describe('readItem', () => {
  it('maps data attributes to a gallery item', () => {
    expect(
      readItem({
        galleryFull: '/a-1600.webp',
        galleryFullset: '/a-640.webp 640w, /a-1600.webp 1600w',
        galleryThumb: '/a-192.webp',
        galleryAlt: 'Grey terrain',
        galleryLabel: 'CORE',
        galleryCaption: 'Four cuts.',
        galleryFigure: 'FIG. 01',
        galleryWidth: '1600',
        galleryHeight: '1200',
      }),
    ).toEqual({
      src: '/a-1600.webp',
      srcset: '/a-640.webp 640w, /a-1600.webp 1600w',
      thumb: '/a-192.webp',
      alt: 'Grey terrain',
      label: 'CORE',
      caption: 'Four cuts.',
      figure: 'FIG. 01',
      width: 1600,
      height: 1200,
    });
  });

  it('fills optional fields with empty values and falls back to the full image for the thumbnail', () => {
    expect(readItem({ galleryFull: '/b.webp' })).toEqual({
      src: '/b.webp',
      srcset: '',
      thumb: '/b.webp',
      alt: '',
      label: '',
      caption: '',
      figure: '',
      width: 0,
      height: 0,
    });
  });

  it('rejects an element without an image', () => {
    expect(readItem({ galleryLabel: 'X' })).toBeNull();
  });
});

describe('collectItems', () => {
  const el = (dataset: Record<string, string>) => ({ dataset });

  it('collects every gallery trigger in document order and skips broken ones', () => {
    const nodes = [el({ galleryFull: '/1.webp' }), el({ galleryLabel: 'no image' }), el({ galleryFull: '/2.webp' })];
    let asked = '';
    const root = {
      querySelectorAll: (selector: string) => {
        asked = selector;
        return nodes;
      },
    };
    const { items, triggers } = collectItems(root);
    expect(asked).toBe(GALLERY_SELECTOR);
    expect(items.map((item) => item.src)).toEqual(['/1.webp', '/2.webp']);
    expect(triggers).toEqual([nodes[0], nodes[2]]);
  });
});
