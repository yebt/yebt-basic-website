/**
 * CV helpers: pure date arithmetic and formatting for the CV data in
 * `src/data/cv.ts`. No clock, DOM or file system: callers pass the reference
 * date, so every rule is unit-testable.
 */

/** A calendar month, `YYYY-MM`. */
export type YearMonth = `${number}-${number}`;

export interface Period {
  start: YearMonth;
  /** Missing while the role is current. */
  end?: YearMonth;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parse(ym: string): { year: number; month: number } {
  const match = /^(\d{4})-(\d{2})$/.exec(ym);
  const month = match ? Number(match[2]) : 0;
  if (!match || month < 1 || month > 12) throw new Error(`Expected YYYY-MM, got "${ym}"`);
  return { year: Number(match[1]), month };
}

/** Running month number: consecutive calendar months differ by one. */
export function monthIndex(ym: string): number {
  const { year, month } = parse(ym);
  return year * 12 + (month - 1);
}

/** The calendar month of a date, read in UTC so builds agree across time zones. */
export function toYearMonth(date: Date): YearMonth {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}` as YearMonth;
}

/**
 * Months from `start` to `end`, both counted. This is the convention the
 * source CV and LinkedIn use ("Oct 2024 – Jun 2025 · 9 months").
 */
export function monthsInclusive(start: YearMonth, end: YearMonth): number {
  const months = monthIndex(end) - monthIndex(start) + 1;
  if (months < 1) throw new Error(`Period ends (${end}) before it starts (${start})`);
  return months;
}

/** Length of one role; a current role runs to the month of `asOf`. */
export function roleMonths(period: Period, asOf: Date): number {
  return monthsInclusive(period.start, period.end ?? toYearMonth(asOf));
}

/**
 * Months of experience across roles: every calendar month covered by at least
 * one role counts once, so overlapping roles are not added twice.
 */
export function experienceMonths(periods: Period[], asOf: Date): number {
  const covered = new Set<number>();
  for (const period of periods) {
    const first = monthIndex(period.start);
    const last = monthIndex(period.end ?? toYearMonth(asOf));
    for (let m = first; m <= last; m++) covered.add(m);
  }
  return covered.size;
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "2 yrs 1 mo", "9 mos", "4 yrs". */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(plural(years, 'yr', 'yrs'));
  if (rest || !years) parts.push(plural(rest, 'mo', 'mos'));
  return parts.join(' ');
}

/**
 * Headline figure for the summary: whole years, rounded down, with a "+" when
 * months are left over (47 months -> "3+ years", 48 -> "4 years"). Under a
 * year it says months.
 */
export function yearsLabel(months: number): string {
  const years = Math.floor(months / 12);
  if (!years) return plural(months, 'month', 'months');
  const unit = years === 1 ? 'year' : 'years';
  return `${years}${months % 12 ? '+' : ''} ${unit}`;
}

/** "Oct 2024". */
export function formatYearMonth(ym: YearMonth): string {
  const { year, month } = parse(ym);
  return `${MONTHS[month - 1]} ${year}`;
}

/** "Oct 2024 – Present", "Nov 2022 – Nov 2024". */
export function formatRange(period: Period): string {
  return `${formatYearMonth(period.start)} – ${period.end ? formatYearMonth(period.end) : 'Present'}`;
}
