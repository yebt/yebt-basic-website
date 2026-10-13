/** A project matches when nothing is selected or it uses any selected technology. */
export function matchesStack(stack: readonly string[], selected: readonly string[]): boolean {
  if (selected.length === 0) return true;
  const wanted = new Set(selected.map((s) => s.toUpperCase()));
  return stack.some((s) => wanted.has(s.toUpperCase()));
}

export function uniqueStack(stacks: readonly (readonly string[])[]): string[] {
  return [...new Set(stacks.flat())].sort((a, b) => a.localeCompare(b));
}
