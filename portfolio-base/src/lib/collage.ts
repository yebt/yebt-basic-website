/**
 * Collage geometry: a 12 x 9 grid of square cells (100 units each, so the
 * guide-line overlay can use the same coordinates as a 1200 x 900 viewBox).
 * Areas use CSS grid-area order: "row-start / col-start / row-end / col-end".
 * Pure: no DOM, so the presets and labels are unit-testable.
 */

export const COLLAGE = { cols: 12, rows: 9, cell: 100 } as const;

export interface Box {
  row: number;
  col: number;
  rows: number;
  cols: number;
}

export interface Arc {
  /** Quarter arc from (cx, cy - r) round to (cx + r, cy). */
  cx: number;
  cy: number;
  r: number;
}

export interface Layout {
  /** Where the 1st, 2nd, ... image goes. */
  cuts: string[];
  /** Solid dark blocks between the cuts. */
  blocks: string[];
  /** Guide lines across the whole collage, in viewBox units. */
  rules: { h: number[]; v: number[] };
  arcs: Arc[];
}

export function parseArea(area: string): Box {
  const parts = area.split('/').map((p) => Number(p.trim()));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n))) throw new Error(`Invalid collage area "${area}"`);
  const [r1, c1, r2, c2] = parts;
  const inside = r1 >= 1 && c1 >= 1 && r2 <= COLLAGE.rows + 1 && c2 <= COLLAGE.cols + 1;
  if (!inside || r2 <= r1 || c2 <= c1) throw new Error(`Collage area "${area}" is outside the ${COLLAGE.cols}x${COLLAGE.rows} grid or empty`);
  return { row: r1, col: c1, rows: r2 - r1, cols: c2 - c1 };
}

export function toGridArea(box: Box): string {
  return `${box.row} / ${box.col} / ${box.row + box.rows} / ${box.col + box.cols}`;
}

/** Tiny technical label for a cut: its name and size in collage units. */
export function cutLabel(index: number, box: Box, label?: string): string {
  const name = label ?? `C-${String(index + 1).padStart(2, '0')}`;
  return `${name} · ${box.cols * COLLAGE.cell}×${box.rows * COLLAGE.cell}`;
}

export const LAYOUTS = {
  /** Four cuts: a tall centre piece, a wide band left, a bloom right, a paper strip below. */
  tower: {
    cuts: ['1 / 5 / 7 / 9', '2 / 1 / 5 / 5', '4 / 8 / 8 / 12', '7 / 1 / 10 / 9'],
    blocks: ['1 / 9 / 4 / 13', '5 / 1 / 7 / 5', '8 / 9 / 10 / 12'],
    rules: { h: [100, 600], v: [400, 800, 1100] },
    arcs: [
      { cx: 800, cy: 600, r: 300 },
      { cx: 400, cy: 800, r: 200 },
    ],
  },
  /** Three overlapping cuts on a diagonal. */
  spread: {
    cuts: ['1 / 1 / 7 / 7', '3 / 6 / 9 / 11', '6 / 9 / 10 / 13'],
    blocks: ['1 / 9 / 3 / 13', '7 / 1 / 10 / 6'],
    rules: { h: [200, 500], v: [500, 800] },
    arcs: [
      { cx: 600, cy: 600, r: 400 },
      { cx: 900, cy: 900, r: 300 },
    ],
  },
  /** Two cuts, offset. */
  pair: {
    cuts: ['2 / 1 / 9 / 7', '1 / 6 / 7 / 12'],
    blocks: ['6 / 10 / 10 / 13'],
    rules: { h: [300], v: [600, 1100] },
    arcs: [{ cx: 600, cy: 900, r: 300 }],
  },
} satisfies Record<string, Layout>;

export type LayoutName = keyof typeof LAYOUTS;
