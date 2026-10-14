/**
 * Helpers for entry pages (projects, garden notes): previous/next, related
 * entries and reading time. Pure, so they are unit-testable.
 */

/** The entries before and after the one matching `isCurrent` in an ordered list. */
export function neighbours<T>(list: readonly T[], isCurrent: (item: T) => boolean): { prev?: T; next?: T } {
  const i = list.findIndex(isCurrent);
  if (i < 0) return { prev: undefined, next: undefined };
  return { prev: list[i - 1], next: list[i + 1] };
}

/**
 * Other entries ranked by how many keys (tags, stack items) they share with
 * the current one; entries sharing nothing are left out. Stable for ties.
 */
export function related<T>(items: readonly T[], isCurrent: (item: T) => boolean, keysOf: (item: T) => readonly string[], limit: number): T[] {
  const current = items.find(isCurrent);
  if (!current) return [];
  const own = new Set(keysOf(current).map((k) => k.toLowerCase()));
  return items
    .filter((item) => !isCurrent(item))
    .map((item, order) => ({ item, order, score: keysOf(item).filter((k) => own.has(k.toLowerCase())).length }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((entry) => entry.item);
}

const WORDS_PER_MINUTE = 220;

/** Minutes to read a Markdown/MDX body: prose only (no imports, component tags or code fences), at least 1. */
export function readingMinutes(body: string): number {
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^\s*(import|export)\s.*$/gm, ' ')
    .replace(/<[A-Z][\s\S]*?\/>/g, ' ')
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ');
  const words = prose.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
