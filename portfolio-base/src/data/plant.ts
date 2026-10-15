/**
 * Plant mark geometry (viewBox 0 0 32 32), shared by the static mark and the
 * hero's blueprint-to-build animation so both always draw the same sprout.
 */
export const plant = {
  stem: 'M16 29.5V10',
  ground: 'M9 29.5h14',
  groundSolid: 'M10 29.5h12',
  leafLow: 'M15.6 22.4C11 23 6 20.5 4.4 14.2 10 13.6 14.8 16.6 15.6 22.4Z',
  veinLow: 'M15.6 22.4 7.5 16.3',
  leafHigh: 'M16.4 16.4C21 17 26 14 27.6 7.8 22 7.2 17.2 10.4 16.4 16.4Z',
  veinHigh: 'M16.4 16.4 24.6 10',
  bud: 'M16 9.6C14 8.1 13.4 5.2 16 2.4 18.6 5.2 18 8.1 16 9.6Z',
  nodes: [
    [16, 22.4],
    [16, 16.4],
  ],
} as const;
