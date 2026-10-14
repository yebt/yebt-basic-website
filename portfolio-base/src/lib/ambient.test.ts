import { describe, expect, it } from 'vitest';
import {
  BLOB_COUNT,
  PALETTES,
  blobAt,
  falloff,
  frameDue,
  gridFor,
  heroMask,
  shade,
  tintAt,
  wave,
  warp,
} from './ambient';

describe('wave', () => {
  it('stays within -1..1 and is deterministic', () => {
    for (let t = 0; t < 400; t += 0.37) {
      const v = wave(t, 3);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
      expect(wave(t, 3)).toBe(v);
    }
  });

  it('moves smoothly: a small step in time is a small step in value', () => {
    for (let t = 0; t < 200; t += 1.3) {
      expect(Math.abs(wave(t + 0.01, 7) - wave(t, 7))).toBeLessThan(0.02);
    }
  });

  it('differs between seeds', () => {
    expect(wave(10, 1)).not.toBeCloseTo(wave(10, 2), 3);
  });
});

describe('blobAt', () => {
  it('keeps every blob near the viewport with a bounded radius', () => {
    for (let i = 0; i < BLOB_COUNT; i++) {
      for (let t = 0; t < 600; t += 2.9) {
        const b = blobAt(i, t);
        expect(b.x).toBeGreaterThanOrEqual(-0.15);
        expect(b.x).toBeLessThanOrEqual(1.15);
        expect(b.y).toBeGreaterThanOrEqual(-0.15);
        expect(b.y).toBeLessThanOrEqual(1.15);
        expect(b.r).toBeGreaterThanOrEqual(0.12);
        expect(b.r).toBeLessThanOrEqual(0.34);
        expect(b.tint).toBeGreaterThanOrEqual(0);
        expect(b.tint).toBeLessThanOrEqual(1);
      }
    }
  });

  it('drifts slowly: a frame at 30 fps moves a blob by well under 1% of the viewport', () => {
    for (let i = 0; i < BLOB_COUNT; i++) {
      const a = blobAt(i, 50);
      const b = blobAt(i, 50 + 1 / 30);
      expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeLessThan(0.002);
    }
  });

  it('spreads the blobs apart rather than stacking them', () => {
    const xs = Array.from({ length: BLOB_COUNT }, (_, i) => blobAt(i, 0).x);
    expect(new Set(xs.map((x) => x.toFixed(3))).size).toBe(BLOB_COUNT);
  });
});

describe('warp', () => {
  it('displaces points by a small amount only', () => {
    for (let t = 0; t < 100; t += 3.1) {
      const [x, y] = warp(0.4, 0.6, t);
      expect(Math.abs(x - 0.4)).toBeLessThan(0.08);
      expect(Math.abs(y - 0.6)).toBeLessThan(0.08);
    }
  });
});

describe('falloff', () => {
  it('is 1 at the centre and decreases with distance', () => {
    expect(falloff(0, 0.2)).toBe(1);
    expect(falloff(0.01, 0.2)).toBeLessThan(1);
    expect(falloff(0.04, 0.2)).toBeLessThan(falloff(0.01, 0.2));
    expect(falloff(1, 0.2)).toBeLessThan(1e-6);
  });
});

describe('tintAt', () => {
  it('returns the first and last palette stops at the ends', () => {
    const stops = PALETTES.dark.stops;
    expect(tintAt(0, stops)).toEqual(stops[0]);
    expect(tintAt(1, stops)).toEqual(stops[stops.length - 1]);
  });

  it('blends between neighbouring stops', () => {
    const stops: [number, number, number][] = [
      [0, 0, 0],
      [100, 200, 50],
    ];
    expect(tintAt(0.5, stops)).toEqual([50, 100, 25]);
  });
});

describe('shade', () => {
  const blobs = [{ x: 0.5, y: 0.5, r: 0.2, tint: 0 }];

  it('is transparent far from every blob', () => {
    expect(shade(0.02, 0.02, blobs, PALETTES.dark, 1)[3]).toBeLessThan(2);
  });

  it('is tinted by the blob near its centre, within the palette alpha cap', () => {
    const [r, g, b, a] = shade(0.5, 0.5, blobs, PALETTES.dark, 1);
    expect(a).toBeGreaterThan(40);
    expect(a).toBeLessThanOrEqual(Math.round(PALETTES.dark.maxAlpha * 255));
    const [tr, tg, tb] = PALETTES.dark.stops[0];
    expect(Math.abs(r - tr) + Math.abs(g - tg) + Math.abs(b - tb)).toBeLessThan(120);
  });

  it('returns whole 0..255 channels for both palettes', () => {
    for (const palette of [PALETTES.dark, PALETTES.light]) {
      for (let x = 0; x <= 1; x += 0.1) {
        for (const v of shade(x, 0.47, blobs, palette, 1.6)) {
          expect(Number.isInteger(v)).toBe(true);
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThanOrEqual(255);
        }
      }
    }
  });
});

describe('gridFor', () => {
  it('keeps the viewport aspect at a low, capped resolution', () => {
    expect(gridFor(1440, 900, 120)).toEqual({ cols: 120, rows: 75 });
    const tall = gridFor(390, 844, 120);
    expect(tall.rows).toBeLessThanOrEqual(120);
    expect(tall.cols / tall.rows).toBeCloseTo(390 / 844, 1);
  });

  it('never returns an empty grid', () => {
    expect(gridFor(0, 0, 120)).toEqual({ cols: 1, rows: 1 });
  });
});

describe('frameDue', () => {
  it('caps the frame rate', () => {
    expect(frameDue(1000, 1000 - 20, 30)).toBe(false);
    expect(frameDue(1000, 1000 - 34, 30)).toBe(true);
  });
});

describe('heroMask', () => {
  it('hides the field entirely while the hero fills the viewport', () => {
    expect(heroMask(900, 900).active).toBe(false);
    expect(heroMask(1200, 900).active).toBe(false);
  });

  it('starts the field below the hero once it scrolls up', () => {
    const mask = heroMask(400, 900);
    expect(mask.active).toBe(true);
    expect(mask.clear).toBe(400);
    expect(mask.full).toBeGreaterThan(400);
  });

  it('shows the field everywhere once the hero has left (or on pages without one)', () => {
    expect(heroMask(-10, 900)).toEqual({ active: true, clear: 0, full: 0 });
  });
});
