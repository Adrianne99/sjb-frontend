import { cn } from "@/utils/cn";

/** Shared look for text inputs, selects and textareas. */
export function controlClasses(hasError: boolean, className?: string) {
  return cn(
    "w-full rounded-md border bg-surface text-sm text-ink shadow-sm transition-colors",
    "placeholder:text-ink-muted/70 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted",
    "focus:outline-none focus:ring-2",
    hasError
      ? "border-danger-600 focus:border-danger-600 focus:ring-danger-100"
      : "border-border-strong hover:border-primary-300 focus:border-primary-500 focus:ring-primary-100",
    className,
  );
}
