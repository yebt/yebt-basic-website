/**
 * Ambient field behind the content modules: a few large, soft "spheres" that
 * orbit on slow Lissajous paths, breathe, drift in hue and turn as a group,
 * sampled through a gently warped space so their merged outline stays
 * organic. Where the merged field crosses a threshold a faint neon contour
 * glows, like a fluorescent tube seen through frosted acrylic.
 * Pure math only (no DOM), so every function is unit-testable; the renderer
 * lives in `components/Ambient.astro`. Coordinates are 0..1 of the viewport.
 */

export type Rgb = [number, number, number];

export interface Blob {
  x: number;
  y: number;
  /** Radius in units of the viewport's shorter side. */
  r: number;
  /** Position along the palette, 0..1. */
  tint: number;
}

export interface Palette {
  /** Tints along which blobs drift, from steel blue to safety orange. */
  stops: Rgb[];
  /** Colour of the contour where the merged field crosses `RIM_LEVEL`. */
  rim: Rgb;
  /** Strength of that contour, 0..1. */
  rimStrength: number;
  /** Alpha ceiling for any pixel, 0..1. */
  maxAlpha: number;
}

export const BLOB_COUNT = 5;

/** Where each blob sits on the palette; only one leans into the orange. */
const TINT_BASE = [0.12, 0.38, 0.55, 0.93, 0.24];

const GOLDEN_ANGLE = 2.399963;
const RIM_LEVEL = 0.55;
const RIM_WIDTH = 0.07;

/**
 * Dark: drawn with `screen`, so tints add light to the concrete.
 * Light: drawn with `multiply`, so tints read as coloured shade on pale concrete.
 */
export const PALETTES: { dark: Palette; light: Palette } = {
  dark: {
    stops: [
      [62, 112, 205],
      [150, 205, 255],
      [82, 132, 214],
      [255, 106, 31],
    ],
    rim: [226, 240, 255],
    rimStrength: 0.55,
    maxAlpha: 0.5,
  },
  light: {
    stops: [
      [136, 166, 222],
      [194, 218, 246],
      [148, 176, 226],
      [248, 156, 100],
    ],
    rim: [112, 150, 214],
    rimStrength: 0.4,
    maxAlpha: 0.62,
  },
};

/**
 * Smooth pseudo-noise in -1..1: three sines with irrational frequency ratios,
 * so the sum never visibly repeats. `seed` shifts the phases.
 */
export function wave(t: number, seed: number): number {
  return (Math.sin(t + seed * 1.7) + 0.6 * Math.sin(t * 1.618 + seed * 3.1) + 0.35 * Math.sin(t * 2.718 + seed * 5.3)) / 1.95;
}

/** Blob `i` at time `t` (seconds): Lissajous orbit, slow group rotation, breathing radius. */
export function blobAt(i: number, t: number): Blob {
  const phase = i * GOLDEN_ANGLE;
  const fx = 0.019 * (1 + 0.31 * i);
  const fy = 0.023 * (1 + 0.17 * i);
  const ax = 0.32 + 0.06 * wave(t * 0.05, i);
  const ay = 0.3 + 0.06 * wave(t * 0.043, i + 5);
  const lx = ax * Math.sin(fx * t + phase);
  const ly = ay * Math.sin(fy * t + phase * 1.618);
  const turn = 0.011 * t;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const base = TINT_BASE[i % TINT_BASE.length];
  return {
    x: 0.5 + lx * cos - ly * sin,
    y: 0.5 + lx * sin + ly * cos,
    r: 0.23 + 0.07 * wave(t * 0.07, i + 11),
    tint: Math.min(1, Math.max(0, base + 0.12 * wave(t * 0.031, i + 23))),
  };
}

/** Domain warp: nudges a sample point along slow, crossing sine currents. */
export function warp(x: number, y: number, t: number): [number, number] {
  return [
    x + 0.035 * Math.sin(3.1 * y + t * 0.21) + 0.02 * Math.sin(5.7 * (x + y) - t * 0.13),
    y + 0.035 * Math.sin(2.7 * x - t * 0.17) + 0.02 * Math.cos(4.3 * (x - y) + t * 0.11),
  ];
}

/** Gaussian falloff for a squared distance `d2` and radius `r`. */
export function falloff(d2: number, r: number): number {
  return Math.exp(-d2 / (r * r));
}

/** Colour at `t` (0..1) along the palette stops, linearly blended. */
export function tintAt(t: number, stops: Rgb[]): Rgb {
  const n = stops.length;
  const pos = Math.min(1, Math.max(0, t)) * (n - 1);
  const i = Math.min(n - 2, Math.floor(pos));
  const f = pos - i;
  if (f >= 1) return [...stops[n - 1]] as Rgb;
  const a = stops[i];
  const b = stops[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/**
 * RGBA (whole 0..255 channels) of the field at (x, y). `aspect` is the
 * viewport's width / height, so blobs stay round on any screen.
 */
export function shade(x: number, y: number, blobs: readonly Blob[], palette: Palette, aspect: number): [number, number, number, number] {
  const sx = Math.max(aspect, 1);
  const sy = Math.max(1 / aspect, 1);
  let field = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  for (const blob of blobs) {
    const dx = (x - blob.x) * sx;
    const dy = (y - blob.y) * sy;
    const w = falloff(dx * dx + dy * dy, blob.r);
    if (w < 1e-4) continue;
    const c = tintAt(blob.tint, palette.stops);
    field += w;
    r += c[0] * w;
    g += c[1] * w;
    b += c[2] * w;
  }
  if (field < 1e-4) return [0, 0, 0, 0];
  r /= field;
  g /= field;
  b /= field;
  const body = 1 - Math.exp(-field * 1.6);
  const edge = (field - RIM_LEVEL) / RIM_WIDTH;
  const rim = palette.rimStrength * Math.exp(-edge * edge);
  r += (palette.rim[0] - r) * rim;
  g += (palette.rim[1] - g) * rim;
  b += (palette.rim[2] - b) * rim;
  const alpha = palette.maxAlpha * Math.max(body, rim);
  const byte = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  return [byte(r), byte(g), byte(b), byte(alpha * 255)];
}

/** Low-resolution render grid with the viewport's aspect; the longer side has `max` cells. */
export function gridFor(width: number, height: number, max: number): { cols: number; rows: number } {
  if (width <= 0 || height <= 0) return { cols: 1, rows: 1 };
  if (width >= height) return { cols: max, rows: Math.max(1, Math.round((max * height) / width)) };
  return { cols: Math.max(1, Math.round((max * width) / height)), rows: max };
}

/** True when enough time has passed since the last frame for the frame-rate cap. */
export function frameDue(now: number, last: number, fps: number): boolean {
  return now - last >= 1000 / fps - 1;
}

/**
 * Keeps the field out from behind the hero portrait: `clear` is the viewport
 * y above which it is fully hidden (the hero's bottom edge), `full` where it
 * reaches full strength. While the hero fills the viewport it is inactive.
 */
export function heroMask(heroBottom: number, viewportHeight: number): { active: boolean; clear: number; full: number } {
  if (heroBottom <= 0) return { active: true, clear: 0, full: 0 };
  if (heroBottom >= viewportHeight - 60) return { active: false, clear: viewportHeight, full: viewportHeight };
  return { active: true, clear: heroBottom, full: heroBottom + Math.min(240, viewportHeight * 0.3) };
}
