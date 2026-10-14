/**
 * Pure helpers for the progressive ASCII portrait background.
 * No DOM access here so every rule is unit-testable.
 */

/** Characters from empty to dense. */
export const RAMP = ' .:-=+*#%@';

/**
 * Cell sizes in px, coarse to fine, shrinking by a constant ratio so the
 * resolve reads as one continuous motion instead of a few jumps.
 * Interpolates geometrically from `from` to `to` and drops rounding duplicates.
 */
export function stepSequence(from: number, to: number, count: number): number[] {
  const steps: number[] = [];
  const n = Math.max(1, count);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 1 : i / (n - 1);
    const size = Math.round(from * Math.pow(to / from, t));
    if (steps[steps.length - 1] !== size) steps.push(size);
  }
  return steps;
}

/** Cell sizes in px, coarse to fine. */
export const STEPS: readonly number[] = stepSequence(40, 6, 10);

/** Milliseconds each step stays on screen. */
export const STEP_MS = 340;

/** Milliseconds a cell flickers through similar glyphs before it settles. */
export const SCRAMBLE_MS = 150;

/** Window in which cells of a step start scrambling (staggered per cell). */
export const SETTLE_WINDOW_MS = STEP_MS - SCRAMBLE_MS - 20;

/** Milliseconds between glyph swaps while a cell scrambles. */
export const FLICKER_MS = 50;

/** Milliseconds the canvas takes to fade in once the portrait has loaded. */
export const FADE_IN_MS = 800;

/** Idle shimmer: one tick every SHIMMER_TICK_MS, each touched cell holds its swap SHIMMER_HOLD_MS. */
export const SHIMMER_TICK_MS = 160;
export const SHIMMER_HOLD_MS = 320;

/**
 * Glyphs from empty to dense (Geist Mono covers all of them). Every step draws
 * a different, density-ordered subset so the texture visibly changes as cells shrink.
 */
export const GLYPHS = ' .\'`,:;~-^"!il|+=<>?*rcvxzunJLCYUXZO0QB#%&$@';

/** Glyphs in the first (coarsest) and last (finest) step sets. */
export const MIN_GLYPHS = 5;
export const MAX_GLYPHS = 12;

/** Golden-ratio phase so consecutive steps sample far-apart positions of each bucket. */
const PHI = 0.6180339887;

/**
 * Density-ordered glyph set for `step` of `total`: always starts with the empty
 * glyph, grows from MIN_GLYPHS to MAX_GLYPHS, and shifts its sampling phase
 * every step so consecutive steps share few glyphs.
 */
export function glyphSetForStep(step: number, total: number, glyphs: string = GLYPHS): string {
  const len = glyphs.length;
  const t = total <= 1 ? 1 : Math.min(1, Math.max(0, step / (total - 1)));
  const count = Math.min(len, Math.round(MIN_GLYPHS + (MAX_GLYPHS - MIN_GLYPHS) * t));
  const bucket = (len - 1) / (count - 1);
  const phase = ((step * PHI) % 1) - 0.5;
  let out = glyphs[0];
  let prev = 0;
  for (let k = 1; k < count; k++) {
    const remaining = count - 1 - k;
    const ideal = Math.round(k * bucket - bucket / 2 + bucket * (0.5 + phase * 0.9));
    const index = Math.min(len - 1 - remaining, Math.max(prev + 1, ideal));
    out += glyphs[index];
    prev = index;
  }
  return out;
}

/** Deterministic integer hash of three numbers mapped to 0..1 (no Math.random, so frames are reproducible). */
export function hash01(a: number, b: number, c: number): number {
  let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul(b | 0, 0x165667b1) ^ Math.imul(c | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * Index of a glyph of similar density to `target` (within two places), never
 * the empty glyph and never the target itself, chosen by `seed` (0..1).
 */
export function scrambleIndex(target: number, n: number, seed: number): number {
  const lo = Math.max(1, target - 2);
  const hi = Math.min(n - 1, target + 2);
  const options: number[] = [];
  for (let i = lo; i <= hi; i++) if (i !== target) options.push(i);
  if (options.length === 0) return Math.max(1, Math.min(n - 1, target));
  return options[Math.min(options.length - 1, Math.floor(seed * options.length))];
}

/**
 * Milliseconds after the step starts at which the cell begins to scramble:
 * a diagonal sweep from the top-left, broken up by per-cell jitter.
 */
export function settleDelay(col: number, row: number, cols: number, rows: number, windowMs: number): number {
  const sweep = (col / Math.max(1, cols - 1)) * 0.6 + (row / Math.max(1, rows - 1)) * 0.4;
  const jitter = hash01(col, row, 7);
  return windowMs * (sweep * 0.55 + jitter * 0.45);
}

/** Cells to swap per shimmer tick: sparse and capped so the idle state stays cheap. */
export function shimmerCount(cells: number): number {
  if (cells <= 0) return 0;
  return Math.max(1, Math.min(24, Math.round(cells * 0.0012)));
}

/** Cubic ease-out on a progress value clamped to 0..1. */
export function easeOut(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return 1 - Math.pow(1 - x, 3);
}

/** Viewport width at which the portrait uses the desktop placement. */
export const DESKTOP_MIN_WIDTH = 820;

/** Mid-tone boost applied before picking a ramp character. */
const RAMP_GAIN = 1.15;

/** Relative luminance (Rec. 601 weights) in the range 0..1. */
export function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/**
 * Intensity used for both the character and its alpha.
 * Dark theme: bright pixels are dense. Light theme: dark pixels are dense.
 */
export function intensity(lum: number, dark: boolean): number {
  return dark ? lum : 1 - lum;
}

/** Index into a ramp of length `n` for a luminance; see `charFor`. */
export function charIndexFor(lum: number, n: number, dark: boolean): number {
  const index = Math.min(n - 1, Math.floor(intensity(lum, dark) * n * RAMP_GAIN));
  return Math.max(0, index);
}

export function charFor(lum: number, ramp: string, dark: boolean): string {
  return ramp[charIndexFor(lum, ramp.length, dark)];
}

export function gridSize(width: number, height: number, cell: number): { cols: number; rows: number } {
  return {
    cols: Math.max(1, Math.ceil(width / cell)),
    rows: Math.max(1, Math.ceil(height / cell)),
  };
}

/**
 * Square portrait box inside the hero. Desktop: bottom aligned in the right
 * half so the copy and the actions lead. Mobile: smaller, shifted right and
 * partly below the fold of the hero.
 */
export function portraitPlacement(width: number, height: number): { size: number; x: number; y: number } {
  if (width >= DESKTOP_MIN_WIDTH) {
    const size = height * 0.86;
    return { size, x: width - size * 0.92, y: height - size };
  }
  const size = width * 0.95;
  return { size, x: width - size * 0.82, y: height - size * 0.9 };
}

/**
 * Fill colour channels [r, g, b, alpha] for a character, derived from the
 * sampled pixel, its intensity v (0..1) and its coverage (0..1, the sampled
 * alpha of the feathered photo).
 */
export function cellColor(
  r: number,
  g: number,
  b: number,
  v: number,
  dark: boolean,
  coverage = 1,
): [number, number, number, number] {
  if (dark) {
    return [
      Math.min(255, Math.round(r * 1.35 + 18)),
      Math.min(255, Math.round(g * 1.2 + 12)),
      Math.min(255, Math.round(b * 1.05 + 8)),
      (0.22 + v * 0.78) * coverage,
    ];
  }
  return [Math.round(r * 0.55), Math.round(g * 0.5), Math.round(b * 0.48), (0.25 + v * 0.7) * coverage];
}

/** `cellColor` serialised as a CSS rgba() string. */
export function colorFor(r: number, g: number, b: number, v: number, dark: boolean, coverage = 1): string {
  const [R, G, B, A] = cellColor(r, g, b, v, dark, coverage);
  return `rgba(${R},${G},${B},${A.toFixed(2)})`;
}
