import { describe, expect, it } from 'vitest';
import { COLLAGE, LAYOUTS, cutLabel, parseArea, toGridArea } from './collage';

describe('parseArea', () => {
  it('reads a CSS grid-area "row-start / col-start / row-end / col-end" into a box in grid units', () => {
    expect(parseArea('1 / 5 / 7 / 9')).toEqual({ row: 1, col: 5, rows: 6, cols: 4 });
  });

  it('tolerates missing spaces', () => {
    expect(parseArea('2/1/5/5')).toEqual({ row: 2, col: 1, rows: 3, cols: 4 });
  });

  it('rejects areas outside the collage grid or with no size', () => {
    expect(() => parseArea('0 / 1 / 2 / 2')).toThrow();
    expect(() => parseArea(`1 / 1 / 2 / ${COLLAGE.cols + 2}`)).toThrow();
    expect(() => parseArea('3 / 3 / 3 / 5')).toThrow();
    expect(() => parseArea('nonsense')).toThrow();
  });
});

describe('toGridArea', () => {
  it('round-trips with parseArea', () => {
    expect(toGridArea(parseArea('4 / 8 / 8 / 12'))).toBe('4 / 8 / 8 / 12');
  });
});

describe('cutLabel', () => {
  it('names a cut by index and its size in collage units (one cell = 100)', () => {
    expect(cutLabel(0, parseArea('1 / 5 / 7 / 9'))).toBe('C-01 · 400×600');
  });

  it('prefers an author label', () => {
    expect(cutLabel(2, parseArea('1 / 1 / 2 / 2'), 'CORE')).toBe('CORE · 100×100');
  });
});

describe('LAYOUTS', () => {
  it('keeps every preset inside the grid', () => {
    for (const layout of Object.values(LAYOUTS)) {
      for (const area of [...layout.cuts, ...layout.blocks]) expect(() => parseArea(area)).not.toThrow();
    }
  });

  it('keeps guide lines and arcs inside the collage viewBox', () => {
    const W = COLLAGE.cols * COLLAGE.cell;
    const H = COLLAGE.rows * COLLAGE.cell;
    for (const layout of Object.values(LAYOUTS)) {
      for (const y of layout.rules.h) expect(y).toBeGreaterThanOrEqual(0), expect(y).toBeLessThanOrEqual(H);
      for (const x of layout.rules.v) expect(x).toBeGreaterThanOrEqual(0), expect(x).toBeLessThanOrEqual(W);
      for (const arc of layout.arcs) {
        expect(arc.cx + arc.r).toBeLessThanOrEqual(W);
        expect(arc.cy - arc.r).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
