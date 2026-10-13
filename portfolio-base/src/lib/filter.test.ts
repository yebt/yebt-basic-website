import { describe, expect, it } from 'vitest';
import { matchesStack, uniqueStack } from './filter';

describe('matchesStack', () => {
  it('shows every project when nothing is selected', () => {
    expect(matchesStack(['GO'], [])).toBe(true);
  });

  it('shows a project that uses any selected technology', () => {
    expect(matchesStack(['GO', 'POSTGRES'], ['VUE', 'POSTGRES'])).toBe(true);
  });

  it('hides a project that uses none of them', () => {
    expect(matchesStack(['GO', 'POSTGRES'], ['VUE'])).toBe(false);
  });

  it('compares case-insensitively', () => {
    expect(matchesStack(['TypeScript'], ['TYPESCRIPT'])).toBe(true);
  });
});

describe('uniqueStack', () => {
  it('returns each technology once, sorted', () => {
    expect(uniqueStack([['VUE', 'GO'], ['GO', 'ASTRO']])).toEqual(['ASTRO', 'GO', 'VUE']);
  });
});
