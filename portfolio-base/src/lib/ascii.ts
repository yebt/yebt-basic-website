/**
 * Pure helpers for the progressive ASCII portrait background.
 * No DOM access here so every rule is unit-testable.
 */

/** Characters from empty to dense. */
export const RAMP = ' .:-=+*#%@';

/** Characters in the ramp of the first (coarsest) step. */
export const MIN_RAMP_CHARS = 4;

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
export const STEPS: readonly number[] = stepSequence(40, 6, 14);

/** Milliseconds each step stays on screen. */
export const STEP_MS = 240;

/** Milliseconds a new step takes to fade in over the previous one. */
export const CROSSFADE_MS = 200;

/** Milliseconds the canvas takes to fade in once the portrait has loaded. */
export const FADE_IN_MS = 800;

/**
 * Subset of `ramp` used at `step` of `total`: starts with MIN_RAMP_CHARS evenly
 * spaced characters (always the emptiest and the densest) and grows to the full
 * ramp on the last step, keeping the empty-to-dense order.
 */
export function rampForStep(step: number, total: number, ramp: string = RAMP): string {
  const len = ramp.length;
  const min = Math.min(MIN_RAMP_CHARS, len);
  const t = total <= 1 ? 1 : Math.min(1, Math.max(0, step / (total - 1)));
  const count = Math.round(min + (len - min) * t);
  if (count >= len) return ramp;
  let out = '';
  for (let k = 0; k < count; k++) out += ramp[Math.round((k * (len - 1)) / (count - 1))];
  return out;
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

export function charFor(lum: number, ramp: string, dark: boolean): string {
  const n = ramp.length;
  const index = Math.min(n - 1, Math.floor(intensity(lum, dark) * n * RAMP_GAIN));
  return ramp[Math.max(0, index)];
}

export function gridSize(width: number, height: number, cell: number): { cols: number; rows: number } {
  return {
    cols: Math.max(1, Math.ceil(width / cell)),
    rows: Math.max(1, Math.ceil(height / cell)),
  };
}

/** Square portrait box: bottom-right on desktop, bottom-centre (nudged right) on mobile. */
export function portraitPlacement(width: number, height: number): { size: number; x: number; y: number } {
  if (width >= DESKTOP_MIN_WIDTH) {
    const size = height * 1.08;
    return { size, x: width - size * 0.9, y: height - size + height * 0.04 };
  }
  const size = width * 1.25;
  return { size, x: (width - size) / 2 + width * 0.12, y: height - size * 0.92 };
}

/** Fill colour for a character, derived from the sampled pixel and its intensity v (0..1). */
export function colorFor(r: number, g: number, b: number, v: number, dark: boolean): string {
  if (dark) {
    const R = Math.min(255, Math.round(r * 1.35 + 18));
    const G = Math.min(255, Math.round(g * 1.2 + 12));
    const B = Math.min(255, Math.round(b * 1.05 + 8));
    return `rgba(${R},${G},${B},${(0.22 + v * 0.78).toFixed(2)})`;
  }
  return `rgba(${Math.round(r * 0.55)},${Math.round(g * 0.5)},${Math.round(b * 0.48)},${(0.25 + v * 0.7).toFixed(2)})`;
}
