import { describe, expect, it } from 'vitest';
import { STAGES, groupByStage } from './garden';

describe('groupByStage', () => {
  it('orders groups from most to least mature and skips empty stages', () => {
    const notes = [
      { id: 'a', stage: 'seedling' as const },
      { id: 'b', stage: 'evergreen' as const },
      { id: 'c', stage: 'seedling' as const },
    ];
    expect(groupByStage(notes, (n) => n.stage)).toEqual([
      { stage: 'evergreen', items: [notes[1]] },
      { stage: 'seedling', items: [notes[0], notes[2]] },
    ]);
  });

  it('exposes the stage order', () => {
    expect(STAGES).toEqual(['evergreen', 'budding', 'seedling']);
  });
});
