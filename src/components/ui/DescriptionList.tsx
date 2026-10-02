// Label / value pairs for read-only details (profile, payment info...).
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface DescriptionItem {
  label: string;
  value: ReactNode;
  /** Take the full row width. */
  wide?: boolean;
}

export function DescriptionList({ items, columns = 2 }: { items: DescriptionItem[]; columns?: 1 | 2 | 3 }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4", columns === 2 && "sm:grid-cols-2", columns === 3 && "sm:grid-cols-2 lg:grid-cols-3")}>
      {items.map((item) => (
        <div key={item.label} className={cn("min-w-0", item.wide && "sm:col-span-full")}>
          <dt className="text-xs font-medium tracking-wide text-ink-muted">{item.label}</dt>
          <dd className="mt-1 text-sm break-words text-ink">{item.value === null || item.value === undefined || item.value === "" ? "—" : item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
