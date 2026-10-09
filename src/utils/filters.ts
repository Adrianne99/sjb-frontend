// Helpers for <FilterBar> (components/table/FilterBar.tsx).

/** How many of `keys` are set to something other than their default. */
export function countActiveFilters(values: Record<string, string>, keys: readonly string[], defaults: Record<string, string> = {}): number {
  return keys.filter((key) => values[key] && values[key] !== (defaults[key] ?? "")).length;
}

/** A patch that resets `keys` to their defaults (for useQueryState's setFilters). */
export function clearedFilters<K extends string>(keys: readonly K[]): Record<K, string> {
  return Object.fromEntries(keys.map((key) => [key, ""])) as Record<K, string>;
}
