import { describe, expect, it } from 'vitest';
import {
  DESKTOP_MIN_WIDTH,
  RAMP,
  STEPS,
  STEP_MS,
  charFor,
  colorFor,
  gridSize,
  luminance,
  portraitPlacement,
  rampForStep,
  stepSequence,
  easeOut,
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
  it('sits in the right part of the hero, bottom aligned and no taller than the hero, on desktop', () => {
    const { size, x, y } = portraitPlacement(1440, 900);
    expect(size).toBeCloseTo(900 * 0.86);
    expect(x).toBeCloseTo(1440 - size * 0.92);
    expect(y).toBeCloseTo(900 - size);
    // Leaves the left half of the hero to the copy and the actions.
    expect(x).toBeGreaterThan(1440 / 2);
  });

  it('shrinks and shifts right below the desktop breakpoint', () => {
    const { size, x, y } = portraitPlacement(390, 844);
    expect(size).toBeCloseTo(390 * 0.95);
    expect(x).toBeCloseTo(390 - size * 0.82);
    expect(y).toBeCloseTo(844 - size * 0.9);
  });

  it('treats the breakpoint width itself as desktop', () => {
    expect(portraitPlacement(DESKTOP_MIN_WIDTH, 700).size).toBeCloseTo(700 * 0.86);
    expect(portraitPlacement(DESKTOP_MIN_WIDTH - 1, 700).size).toBeCloseTo((DESKTOP_MIN_WIDTH - 1) * 0.95);
  });
});

describe('colorFor', () => {
  it('brightens and fades in with intensity on the dark theme', () => {
    expect(colorFor(100, 100, 100, 0, true)).toBe('rgba(153,132,113,0.22)');
    expect(colorFor(255, 255, 255, 1, true)).toBe('rgba(255,255,255,1.00)');
  });

  it('scales the alpha by the sampled coverage so the portrait edge feathers out', () => {
    expect(colorFor(255, 255, 255, 1, true, 0.5)).toBe('rgba(255,255,255,0.50)');
    expect(colorFor(200, 100, 50, 0.5, false, 0.5)).toBe('rgba(110,50,24,0.30)');
  });

  it('darkens the source colour on the light theme', () => {
    expect(colorFor(200, 100, 50, 0.5, false)).toBe('rgba(110,50,24,0.60)');
  });
});

describe('stepSequence', () => {
  it('starts at the coarse size and ends at the fine size', () => {
    const steps = stepSequence(40, 6, 14);
    expect(steps[0]).toBe(40);
    expect(steps[steps.length - 1]).toBe(6);
  });

  it('decreases strictly so every step is a visible change', () => {
    const steps = stepSequence(40, 6, 14);
    for (let i = 1; i < steps.length; i++) expect(steps[i]).toBeLessThan(steps[i - 1]);
  });

  it('keeps the requested length when sizes stay distinct', () => {
    expect(stepSequence(40, 6, 14)).toHaveLength(14);
  });

  it('shrinks by a similar ratio each step (no big jumps at the end)', () => {
    const steps = stepSequence(40, 6, 14);
    for (let i = 1; i < steps.length; i++) expect(steps[i] / steps[i - 1]).toBeGreaterThan(0.7);
  });

  it('drops duplicates produced by rounding', () => {
    const steps = stepSequence(8, 6, 10);
    expect(steps).toEqual([8, 7, 6]);
  });
});

describe('rampForStep', () => {
  it('starts with four characters spanning empty to dense', () => {
    const first = rampForStep(0, 14);
    expect(first).toHaveLength(4);
    expect(first[0]).toBe(RAMP[0]);
    expect(first[first.length - 1]).toBe(RAMP[RAMP.length - 1]);
  });

  it('ends with the full ramp', () => {
    expect(rampForStep(13, 14)).toBe(RAMP);
  });

  it('never shrinks from one step to the next', () => {
    for (let i = 1; i < 14; i++) {
      expect(rampForStep(i, 14).length).toBeGreaterThanOrEqual(rampForStep(i - 1, 14).length);
    }
  });

  it('preserves the empty-to-dense ordering of the full ramp', () => {
    for (let i = 0; i < 14; i++) {
      const indices = [...rampForStep(i, 14)].map((ch) => RAMP.indexOf(ch));
      for (let k = 1; k < indices.length; k++) expect(indices[k]).toBeGreaterThan(indices[k - 1]);
    }
  });

  it('returns the full ramp for a single-step sequence', () => {
    expect(rampForStep(0, 1)).toBe(RAMP);
  });
});

describe('easeOut', () => {
  it('clamps to 0..1 and eases out', () => {
    expect(easeOut(-1)).toBe(0);
    expect(easeOut(0)).toBe(0);
    expect(easeOut(1)).toBe(1);
    expect(easeOut(2)).toBe(1);
    expect(easeOut(0.5)).toBeGreaterThan(0.5);
  });
});

describe('animation constants', () => {
  it('steps from coarse to fine with many small steps', () => {
    expect(STEPS[0]).toBe(40);
    expect(STEPS[STEPS.length - 1]).toBe(6);
    expect(STEPS.length).toBeGreaterThanOrEqual(12);
    expect(STEPS.length).toBeLessThanOrEqual(16);
    expect(RAMP).toBe(' .:-=+*#%@');
  });

  it('resolves in roughly three to four seconds', () => {
    const total = STEPS.length * STEP_MS;
    expect(total).toBeGreaterThanOrEqual(3000);
    expect(total).toBeLessThanOrEqual(4000);
  });
});
