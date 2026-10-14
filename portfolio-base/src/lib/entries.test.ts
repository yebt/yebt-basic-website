import { describe, expect, it } from 'vitest';
import { neighbours, readingMinutes, related } from './entries';

describe('neighbours', () => {
  const list = ['a', 'b', 'c'];

  it('returns the entries before and after the current one', () => {
    expect(neighbours(list, (x) => x === 'b')).toEqual({ prev: 'a', next: 'c' });
  });

  it('leaves the missing side undefined at either end', () => {
    expect(neighbours(list, (x) => x === 'a')).toEqual({ prev: undefined, next: 'b' });
    expect(neighbours(list, (x) => x === 'c')).toEqual({ prev: 'b', next: undefined });
  });

  it('returns nothing when the current entry is not in the list', () => {
    expect(neighbours(list, (x) => x === 'z')).toEqual({ prev: undefined, next: undefined });
  });
});

describe('related', () => {
  const items = [
    { id: 'self', keys: ['go', 'events'] },
    { id: 'two', keys: ['go', 'events', 'postgres'] },
    { id: 'one', keys: ['events'] },
    { id: 'none', keys: ['vue'] },
  ];
  const keysOf = (item: (typeof items)[number]) => item.keys;
  const isSelf = (item: (typeof items)[number]) => item.id === 'self';

  it('ranks other entries by shared keys, most first, and drops the current one', () => {
    expect(related(items, isSelf, keysOf, 3).map((i) => i.id)).toEqual(['two', 'one']);
  });

  it('respects the limit', () => {
    expect(related(items, isSelf, keysOf, 1).map((i) => i.id)).toEqual(['two']);
  });

  it('matches keys case-insensitively', () => {
    const mixed = [
      { id: 'self', keys: ['Architecture'] },
      { id: 'x', keys: ['architecture'] },
    ];
    expect(related(mixed, (i) => i.id === 'self', (i) => i.keys, 3).map((i) => i.id)).toEqual(['x']);
  });
});

describe('readingMinutes', () => {
  it('counts about 220 words a minute and never returns less than 1', () => {
    expect(readingMinutes('word '.repeat(440))).toBe(2);
    expect(readingMinutes('short')).toBe(1);
  });

  it('ignores MDX imports, component tags and code fences', () => {
    const body = ["import { Collage } from './x';", '<Collage images={[a, b]} />', '```', 'code '.repeat(500), '```', 'word '.repeat(220)].join('\n');
    expect(readingMinutes(body)).toBe(1);
  });
});
