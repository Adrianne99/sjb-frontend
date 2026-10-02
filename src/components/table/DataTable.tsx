// Reusable data table.
// • Desktop/tablet: a normal accessible <table>.
// • Phones: each row becomes a card (label: value), so nothing needs sideways scrolling.
//
//   <DataTable
//     caption="Students"
//     rows={students}
//     getRowKey={(s) => s.id}
//     columns={[
//       { header: "Student ID", cell: (s) => s.studentNumber },
//       { header: "Name", cell: (s) => s.formalName, primary: true },
//     ]}
//     loading={loading}
//     empty={{ title: "No students found." }}
//   />
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/States";
import { SkeletonRows } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  /** Shown as the card title on phones. */
  primary?: boolean;
  /** Hide this column in the phone card view. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T) => string | number;
  loading?: boolean;
  loadingLabel?: string;
  empty: { title: string; description?: string; action?: ReactNode };
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
}

const alignClass = { left: "text-left", right: "text-right", center: "text-center" };

export function DataTable<T>({ caption, columns, rows, getRowKey, loading, loadingLabel, empty, onRowClick, rowClassName }: DataTableProps<T>) {
  if (loading && rows.length === 0) {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">{loadingLabel ?? `Loading ${caption.toLowerCase()}...`}</span>
        <SkeletonRows rows={6} />
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title={empty.title} description={empty.description} action={empty.action} />;
  }

  const primary = columns.find((column) => column.primary) ?? columns[0];
  const secondary = columns.filter((column) => column !== primary && !column.hideOnMobile);

  return (
    <div className={cn("relative", loading && "opacity-60 transition-opacity")} aria-busy={loading || undefined}>
      {/* Table (tablet and up) */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-border bg-surface-muted/60">
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={cn("px-4 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap text-ink-soft", alignClass[column.align ?? "left"], column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("transition-colors hover:bg-primary-50/40", onRowClick && "cursor-pointer", rowClassName?.(row))}
              >
                {columns.map((column) => (
                  <td key={column.header} className={cn("px-4 py-3 align-middle text-ink", alignClass[column.align ?? "left"], column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (phones) */}
      <ul className="divide-y divide-border md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={getRowKey(row)} className={cn("px-4 py-3", rowClassName?.(row))}>
            <div className="font-medium text-ink">{primary.cell(row)}</div>
            <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
              {secondary.map((column) => (
                <div key={column.header} className={cn("min-w-0", column.header === "Actions" && "col-span-2")}>
                  {column.header !== "Actions" && <dt className="text-xs text-ink-muted">{column.header}</dt>}
                  <dd className="text-sm break-words text-ink">{column.cell(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
