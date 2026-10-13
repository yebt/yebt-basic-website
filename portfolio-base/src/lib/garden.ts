/** Growth stages, most mature first. */
export const STAGES = ['evergreen', 'budding', 'seedling'] as const;
export type Stage = (typeof STAGES)[number];

export function groupByStage<T>(items: readonly T[], stageOf: (item: T) => Stage): { stage: Stage; items: T[] }[] {
  return STAGES.map((stage) => ({ stage, items: items.filter((item) => stageOf(item) === stage) })).filter(
    (group) => group.items.length > 0,
  );
}
