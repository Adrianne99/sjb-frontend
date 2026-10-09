// Compact filter bar for list pages: the search box (always visible) and a
// "Filters" button that opens the dropdowns. The button shows how many filters
// are in use, and the panel has "Clear filters".
//
//   <FilterBar search={<SearchInput ... />} activeCount={2} onClear={...}>
//     <Select ... />  <Select ... />
//   </FilterBar>
//
// Count and clear helpers: utils/filters.ts.
import { SlidersHorizontal, X } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface FilterBarProps {
  /** Usually the SearchInput. Can be any control that should always show. */
  search?: ReactNode;
  /** Always-visible controls next to the button (e.g. a List / Weekly toggle). */
  extra?: ReactNode;
  /** How many filters differ from their default value. */
  activeCount: number;
  onClear?: () => void;
  /** The filter controls shown in the panel. */
  children: ReactNode;
}

export function FilterBar({ search, extra, activeCount, onClear, children }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-b border-border p-3 sm:p-4">
      <div className="flex items-center gap-2">
        {search && <div className="min-w-0 flex-1">{search}</div>}
        {extra}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            "inline-flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
            open || activeCount > 0 ? "border-primary-300 bg-primary-50 text-primary-800" : "border-border-strong bg-surface text-ink-soft hover:bg-surface-muted",
            !search && !extra && "ml-auto",
          )}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Filters</span>
          <span className="sr-only sm:hidden">Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-700 px-1.5 text-xs font-semibold text-white" aria-label={`${activeCount} in use`}>
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div id={panelId} className="mt-3 border-t border-border pt-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
          {activeCount > 0 && onClear && (
            <button type="button" onClick={onClear} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900">
              <X className="size-3.5" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
