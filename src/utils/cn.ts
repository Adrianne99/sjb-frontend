/** Joins class names, skipping false/null/undefined:  cn("a", isOn && "b") -> "a b" */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
