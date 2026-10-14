import { describe, expect, it } from 'vitest';
import {
  experienceMonths,
  formatDuration,
  formatRange,
  formatYearMonth,
  monthIndex,
  monthsInclusive,
  roleMonths,
  toYearMonth,
  yearsLabel,
} from './cv';

const asOf = new Date('2026-10-14T12:00:00Z');

describe('monthIndex / toYearMonth', () => {
  it('maps YYYY-MM to a running month number', () => {
    expect(monthIndex('2024-10') - monthIndex('2023-10')).toBe(12);
    expect(monthIndex('2025-01') - monthIndex('2024-12')).toBe(1);
  });

  it('rejects anything that is not YYYY-MM with a real month', () => {
    expect(() => monthIndex('2024-13')).toThrow();
    expect(() => monthIndex('Oct 2024')).toThrow();
  });

  it('reads the calendar month of a date in UTC', () => {
    expect(toYearMonth(asOf)).toBe('2026-10');
    expect(toYearMonth(new Date('2026-01-01T00:30:00Z'))).toBe('2026-01');
  });
});

describe('monthsInclusive', () => {
  it('counts the start and the end month, like the CV convention', () => {
    expect(monthsInclusive('2024-10', '2025-06')).toBe(9);
    expect(monthsInclusive('2024-10', '2024-10')).toBe(1);
    expect(monthsInclusive('2022-11', '2024-11')).toBe(25);
  });

  it('refuses an end before the start', () => {
    expect(() => monthsInclusive('2024-10', '2024-09')).toThrow();
  });
});

describe('roleMonths', () => {
  it('runs an open role up to the month of the reference date', () => {
    expect(roleMonths({ start: '2024-10' }, asOf)).toBe(25);
  });

  it('uses the end month of a closed role', () => {
    expect(roleMonths({ start: '2022-11', end: '2024-11' }, asOf)).toBe(25);
  });
});

describe('experienceMonths', () => {
  const roles = [
    { start: '2024-10' },
    { start: '2022-11', end: '2024-11' },
  ];

  it('counts overlapping months once', () => {
    // Nov 2022 .. Oct 2026 inclusive, with Oct-Nov 2024 shared by both roles.
    expect(experienceMonths(roles, asOf)).toBe(48);
  });

  it('leaves gaps between roles out', () => {
    expect(experienceMonths([{ start: '2020-01', end: '2020-06' }, { start: '2021-01', end: '2021-03' }], asOf)).toBe(9);
  });

  it('is zero without roles', () => {
    expect(experienceMonths([], asOf)).toBe(0);
  });
});

describe('formatDuration', () => {
  it('writes years and months the way CVs do', () => {
    expect(formatDuration(1)).toBe('1 mo');
    expect(formatDuration(9)).toBe('9 mos');
    expect(formatDuration(12)).toBe('1 yr');
    expect(formatDuration(25)).toBe('2 yrs 1 mo');
    expect(formatDuration(47)).toBe('3 yrs 11 mos');
    expect(formatDuration(48)).toBe('4 yrs');
  });
});

describe('yearsLabel', () => {
  it('rounds down to whole years and marks a remainder with a plus', () => {
    expect(yearsLabel(48)).toBe('4 years');
    expect(yearsLabel(47)).toBe('3+ years');
    expect(yearsLabel(13)).toBe('1+ year');
    expect(yearsLabel(12)).toBe('1 year');
  });

  it('falls back to months under a year', () => {
    expect(yearsLabel(9)).toBe('9 months');
    expect(yearsLabel(1)).toBe('1 month');
  });
});

describe('formatYearMonth / formatRange', () => {
  it('uses short English month names', () => {
    expect(formatYearMonth('2024-10')).toBe('Oct 2024');
    expect(formatYearMonth('2022-11')).toBe('Nov 2022');
  });

  it('writes an open range as Present', () => {
    expect(formatRange({ start: '2024-10' })).toBe('Oct 2024 – Present');
    expect(formatRange({ start: '2022-11', end: '2024-11' })).toBe('Nov 2022 – Nov 2024');
  });
});
