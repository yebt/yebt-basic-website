/**
 * Pure helpers for the progressive ASCII portrait background.
 * No DOM access here so every rule is unit-testable.
 */

/** Characters from empty to dense. */
export const RAMP = ' .:-=+*#%@';

/** Cell sizes in px, coarse to fine. */
export const STEPS = [40, 30, 21, 14, 10, 6] as const;

/** Milliseconds each step stays on screen. */
export const STEP_MS = 560;

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
