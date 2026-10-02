// Simple single-series bar chart (no chart library needed).
// • One hue (primary blue); the card title names the series, so no legend.
// • Hover a bar to see its value.
// • A hidden table gives screen-reader users the same numbers.
import { cn } from "@/utils/cn";

export interface BarDatum {
  label: string;
  value: number;
  /** Formatted value shown in the tooltip, e.g. "₱24,000.00". */
  display: string;
}

interface BarChartProps {
  data: BarDatum[];
  /** Describes the chart for screen readers, e.g. "Enrollment by year level". */
  title: string;
  orientation?: "vertical" | "horizontal";
  valueLabel: string;
}

export function BarChart({ data, title, orientation = "vertical", valueLabel }: BarChartProps) {
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <figure>
      {orientation === "vertical" ? (
        <div className="flex h-48 items-end gap-2 border-b border-border pt-6" aria-hidden="true">
          {data.map((item) => (
            <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="group relative flex h-full w-full max-w-14 items-end">
                <div
                  className="w-full rounded-t-[4px] bg-primary-600 transition-colors hover:bg-primary-800"
                  style={{ height: `${Math.max(item.value > 0 ? 2 : 0, (item.value / max) * 100)}%` }}
                />
                <Tooltip label={item.label} value={item.display} className="bottom-full mb-1" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className="space-y-3" aria-hidden="true">
          {data.map((item) => (
            <li key={item.label} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-sm">
              <span className="truncate text-ink-soft">{item.label}</span>
              <div className="group relative h-6">
                <div
                  className="h-full rounded-r-[4px] bg-primary-600 transition-colors hover:bg-primary-800"
                  style={{ width: `${Math.max(item.value > 0 ? 1 : 0, (item.value / max) * 100)}%` }}
                />
                <Tooltip label={item.label} value={item.display} className="bottom-full left-0 mb-1" />
              </div>
            </li>
          ))}
        </ul>
      )}
      {orientation === "vertical" && (
        <div className="mt-2 flex gap-2" aria-hidden="true">
          {data.map((item) => (
            <span key={item.label} className="min-w-0 flex-1 truncate text-center text-xs text-ink-muted">
              {item.label}
            </span>
          ))}
        </div>
      )}

      {/* Same data as a table, for screen readers */}
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.label}>
              <td>{item.label}</td>
              <td>{item.display}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function Tooltip({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-10 rounded-md bg-primary-950 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100",
        className,
      )}
    >
      {label}: <strong className="font-semibold">{value}</strong>
    </span>
  );
}
