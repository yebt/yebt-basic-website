import { describe, expect, it } from 'vitest';
import {
  DESKTOP_MIN_WIDTH,
  RAMP,
  STEPS,
  charFor,
  colorFor,
  gridSize,
  luminance,
  portraitPlacement,
} from './ascii';

describe('luminance', () => {
  it('maps black to 0 and white to 1', () => {
    expect(luminance(0, 0, 0)).toBe(0);
    expect(luminance(255, 255, 255)).toBeCloseTo(1, 10);
  });

  it('weights green above red above blue (Rec. 601)', () => {
    expect(luminance(0, 255, 0)).toBeGreaterThan(luminance(255, 0, 0));
    expect(luminance(255, 0, 0)).toBeGreaterThan(luminance(0, 0, 255));
    expect(luminance(255, 0, 0)).toBeCloseTo(0.299, 3);
  });
});

describe('charFor', () => {
  it('uses the sparse end of the ramp for dark pixels on the dark theme', () => {
    expect(charFor(0, RAMP, true)).toBe(' ');
    expect(charFor(1, RAMP, true)).toBe('@');
  });

  it('inverts the ramp on the light theme so dark pixels get dense ink', () => {
    expect(charFor(0, RAMP, false)).toBe('@');
    expect(charFor(1, RAMP, false)).toBe(' ');
  });

  it('boosts mid tones by 15% and clamps to the last ramp index', () => {
    // 0.5 * 10 * 1.15 = 5.75 -> index 5
    expect(charFor(0.5, RAMP, true)).toBe(RAMP[5]);
    expect(charFor(0.95, RAMP, true)).toBe(RAMP[RAMP.length - 1]);
  });

  it('works with any ramp length', () => {
    expect(charFor(0.9, ' #', true)).toBe('#');
  });
});

describe('gridSize', () => {
  it('covers the viewport fully, rounding partial cells up', () => {
    expect(gridSize(1440, 900, 40)).toEqual({ cols: 36, rows: 23 });
    expect(gridSize(1441, 900, 6)).toEqual({ cols: 241, rows: 150 });
  });

  it('never returns an empty grid', () => {
    expect(gridSize(0, 0, 10)).toEqual({ cols: 1, rows: 1 });
  });
});

describe('portraitPlacement', () => {
  it('anchors the portrait bottom right and taller than the viewport on desktop', () => {
    const { size, x, y } = portraitPlacement(1440, 900);
    expect(size).toBeCloseTo(900 * 1.08);
    expect(x).toBeCloseTo(1440 - size * 0.9);
    expect(y).toBeCloseTo(900 - size + 900 * 0.04);
  });

  it('switches to the mobile placement below the desktop breakpoint', () => {
    const { size, x, y } = portraitPlacement(390, 844);
    expect(size).toBeCloseTo(390 * 1.25);
    expect(x).toBeCloseTo((390 - size) / 2 + 390 * 0.12);
    expect(y).toBeCloseTo(844 - size * 0.92);
  });

  it('treats the breakpoint width itself as desktop', () => {
    expect(portraitPlacement(DESKTOP_MIN_WIDTH, 700).size).toBeCloseTo(700 * 1.08);
    expect(portraitPlacement(DESKTOP_MIN_WIDTH - 1, 700).size).toBeCloseTo((DESKTOP_MIN_WIDTH - 1) * 1.25);
  });
});

describe('colorFor', () => {
  it('brightens and fades in with intensity on the dark theme', () => {
    expect(colorFor(100, 100, 100, 0, true)).toBe('rgba(153,132,113,0.22)');
    expect(colorFor(255, 255, 255, 1, true)).toBe('rgba(255,255,255,1.00)');
  });

  it('darkens the source colour on the light theme', () => {
    expect(colorFor(200, 100, 50, 0.5, false)).toBe('rgba(110,50,24,0.60)');
  });
});

describe('animation constants', () => {
  it('steps from coarse to fine', () => {
    expect(STEPS).toEqual([40, 30, 21, 14, 10, 6]);
    expect(RAMP).toBe(' .:-=+*#%@');
  });
});
