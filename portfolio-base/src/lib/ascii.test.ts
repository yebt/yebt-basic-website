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
  stepSequence,
  easeOut,
  GLYPHS,
  MIN_GLYPHS,
  MAX_GLYPHS,
  SCRAMBLE_MS,
  SETTLE_WINDOW_MS,
  cellColor,
  charIndexFor,
  glyphSetForStep,
  hash01,
  scrambleIndex,
  settleDelay,
  shimmerCount,
  levels,
  stretch,
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
  it('centres the portrait behind the frosted slab on desktop, slightly larger than the hero', () => {
    const { size, x, y } = portraitPlacement(1440, 900);
    expect(size).toBeCloseTo(900 * 1.12);
    expect(x + size / 2).toBeCloseTo(1440 / 2);
    expect(y + size / 2).toBeCloseTo(900 / 2);
  });

  it('centres the portrait horizontally on phones, near the top of the hero', () => {
    const { size, x, y } = portraitPlacement(390, 844);
    expect(size).toBeCloseTo(390 * 1.02);
    expect(x + size / 2).toBeCloseTo(390 / 2);
    expect(y).toBeCloseTo(844 * 0.06);
  });

  it('never lets the phone portrait outgrow the hero height', () => {
    const { size } = portraitPlacement(700, 600);
    expect(size).toBeLessThanOrEqual(600 * 0.7);
  });

  it('treats the breakpoint width itself as desktop', () => {
    expect(portraitPlacement(DESKTOP_MIN_WIDTH, 700).size).toBeCloseTo(700 * 1.12);
    expect(portraitPlacement(DESKTOP_MIN_WIDTH - 1, 1400).size).toBeCloseTo((DESKTOP_MIN_WIDTH - 1) * 1.02);
  });
});

describe('levels', () => {
  it('returns the low and high quantiles of the values', () => {
    const values = Array.from({ length: 101 }, (_, i) => i / 100);
    const { lo, hi } = levels(values, 0.05, 0.95);
    expect(lo).toBeCloseTo(0.05);
    expect(hi).toBeCloseTo(0.95);
  });

  it('ignores the order of the input', () => {
    expect(levels([0.9, 0.1, 0.5], 0, 1)).toEqual({ lo: 0.1, hi: 0.9 });
  });

  it('falls back to the full range for an empty input', () => {
    expect(levels([], 0.05, 0.95)).toEqual({ lo: 0, hi: 1 });
  });
});

describe('stretch', () => {
  it('maps lo to 0 and hi to 1, linearly in between', () => {
    expect(stretch(0.2, 0.2, 0.6)).toBe(0);
    expect(stretch(0.6, 0.2, 0.6)).toBe(1);
    expect(stretch(0.4, 0.2, 0.6)).toBeCloseTo(0.5);
  });

  it('clamps values outside the range', () => {
    expect(stretch(0.05, 0.2, 0.6)).toBe(0);
    expect(stretch(0.9, 0.2, 0.6)).toBe(1);
  });

  it('leaves the value as is when the range is degenerate', () => {
    expect(stretch(0.3, 0.5, 0.5)).toBe(0.3);
  });
});

describe('colorFor', () => {
  it('brightens and fades in with intensity on the dark theme', () => {
    expect(colorFor(100, 100, 100, 0, true)).toBe('rgba(153,132,113,0.22)');
    expect(colorFor(255, 255, 255, 1, true)).toBe('rgba(255,255,255,1.00)');
  });

  it('scales the alpha by the sampled coverage so the portrait edge feathers out', () => {
    expect(colorFor(255, 255, 255, 1, true, 0.5)).toBe('rgba(255,255,255,0.50)');
    expect(colorFor(200, 100, 50, 1, false, 0.5)).toBe('rgba(76,36,18,0.50)');
  });

  it('inks the light theme with a deep tone of the source colour and a visible alpha floor', () => {
    expect(colorFor(200, 100, 50, 0, false)).toBe('rgba(76,36,18,0.40)');
    expect(colorFor(200, 100, 50, 1, false)).toBe('rgba(76,36,18,1.00)');
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
  it('steps from coarse to fine', () => {
    expect(STEPS[0]).toBe(40);
    expect(STEPS[STEPS.length - 1]).toBe(6);
    expect(STEPS.length).toBeGreaterThanOrEqual(9);
    expect(STEPS.length).toBeLessThanOrEqual(12);
    expect(RAMP).toBe(' .:-=+*#%@');
  });

  it('resolves in roughly three to four seconds', () => {
    const total = STEPS.length * STEP_MS;
    expect(total).toBeGreaterThanOrEqual(3000);
    expect(total).toBeLessThanOrEqual(4000);
  });

  it('lets every cell finish scrambling before the next step starts', () => {
    expect(SETTLE_WINDOW_MS + SCRAMBLE_MS).toBeLessThanOrEqual(STEP_MS);
    expect(SCRAMBLE_MS).toBeGreaterThanOrEqual(100);
  });
});

describe('charIndexFor', () => {
  it('matches charFor for any ramp', () => {
    for (const lum of [0, 0.1, 0.33, 0.5, 0.77, 1]) {
      expect(RAMP[charIndexFor(lum, RAMP.length, true)]).toBe(charFor(lum, RAMP, true));
      expect(RAMP[charIndexFor(lum, RAMP.length, false)]).toBe(charFor(lum, RAMP, false));
    }
  });
});

describe('glyphSetForStep', () => {
  const total = STEPS.length;
  const sets = Array.from({ length: total }, (_, i) => glyphSetForStep(i, total));

  it('always starts with the empty glyph', () => {
    for (const set of sets) expect(set[0]).toBe(' ');
  });

  it('grows from MIN_GLYPHS to MAX_GLYPHS without shrinking', () => {
    expect(sets[0]).toHaveLength(MIN_GLYPHS);
    expect(sets[total - 1]).toHaveLength(MAX_GLYPHS);
    for (let i = 1; i < total; i++) expect(sets[i].length).toBeGreaterThanOrEqual(sets[i - 1].length);
  });

  it('keeps the empty-to-dense order of GLYPHS', () => {
    for (const set of sets) {
      const indices = [...set].map((ch) => GLYPHS.indexOf(ch));
      for (let k = 1; k < indices.length; k++) expect(indices[k]).toBeGreaterThan(indices[k - 1]);
    }
  });

  it('uses a visibly different glyph set on every step', () => {
    for (let i = 1; i < total; i++) {
      const prev = new Set(sets[i - 1].slice(1));
      const shared = [...sets[i].slice(1)].filter((ch) => prev.has(ch)).length;
      expect(shared).toBeLessThanOrEqual(Math.floor(Math.min(prev.size, sets[i].length - 1) / 2));
    }
  });

  it('is deterministic', () => {
    expect(glyphSetForStep(3, total)).toBe(glyphSetForStep(3, total));
  });
});

describe('hash01', () => {
  it('is deterministic and stays in 0..1', () => {
    expect(hash01(3, 7, 11)).toBe(hash01(3, 7, 11));
    for (let i = 0; i < 200; i++) {
      const h = hash01(i, i * 3, 5);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(1);
    }
  });

  it('spreads neighbouring inputs', () => {
    const values = new Set(Array.from({ length: 100 }, (_, i) => Math.floor(hash01(i, 0, 0) * 10)));
    expect(values.size).toBeGreaterThanOrEqual(8);
  });
});

describe('scrambleIndex', () => {
  it('picks a glyph of similar density, never the empty one', () => {
    for (let seed = 0; seed < 1; seed += 0.05) {
      const i = scrambleIndex(6, 12, seed);
      expect(Math.abs(i - 6)).toBeLessThanOrEqual(2);
      expect(i).toBeGreaterThanOrEqual(1);
      expect(i).toBeLessThan(12);
    }
  });

  it('differs from the target so the swap is visible', () => {
    for (let seed = 0; seed < 1; seed += 0.05) expect(scrambleIndex(6, 12, seed)).not.toBe(6);
    expect(scrambleIndex(1, 5, 0)).not.toBe(1);
    expect(scrambleIndex(4, 5, 0.99)).not.toBe(4);
  });
});

describe('settleDelay', () => {
  it('stays inside the settle window', () => {
    for (let r = 0; r < 20; r++)
      for (let c = 0; c < 30; c++) {
        const d = settleDelay(c, r, 30, 20, 300);
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(300);
      }
  });

  it('sweeps from the top-left towards the bottom-right on average', () => {
    let early = 0;
    let late = 0;
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++) {
        early += settleDelay(c, r, 50, 50, 300);
        late += settleDelay(49 - c, 49 - r, 50, 50, 300);
      }
    expect(early).toBeLessThan(late);
  });
});

describe('cellColor', () => {
  it('returns the channels colorFor serialises', () => {
    expect(cellColor(100, 100, 100, 0, true)).toEqual([153, 132, 113, 0.22]);
    expect(colorFor(200, 100, 50, 1, false, 0.5)).toBe('rgba(76,36,18,0.50)');
    const [r, g, b, a] = cellColor(200, 100, 50, 1, false, 0.5);
    expect([r, g, b]).toEqual([76, 36, 18]);
    expect(a).toBeCloseTo(0.5);
  });
});

describe('shimmerCount', () => {
  it('touches a sparse, bounded number of cells', () => {
    expect(shimmerCount(0)).toBe(0);
    expect(shimmerCount(400)).toBeGreaterThanOrEqual(1);
    expect(shimmerCount(10000)).toBeLessThanOrEqual(40);
    expect(shimmerCount(10000)).toBeLessThan(10000 * 0.01);
  });
});
