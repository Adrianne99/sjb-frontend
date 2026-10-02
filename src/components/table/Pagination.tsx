// "Showing 1–20 of 132"  ‹ Previous  Page 1 of 7  Next ›
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { PaginationMeta } from "@/types";

export function Pagination({ meta, onPageChange }: { meta: PaginationMeta; onPageChange: (page: number) => void }) {
  if (meta.total === 0) return null;
  const from = (meta.page - 1) * meta.pageSize + 1;
  const to = Math.min(meta.page * meta.pageSize, meta.total);

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row">
      <p className="text-ink-muted">
        Showing <span className="font-medium text-ink">{from}</span>–<span className="font-medium text-ink">{to}</span> of{" "}
        <span className="font-medium text-ink">{meta.total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)} leftIcon={<ChevronLeft className="size-4" aria-hidden="true" />}>
          Previous
        </Button>
        <span className="px-1 text-ink-muted" aria-current="page">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button variant="secondary" size="sm" disabled={meta.page >= meta.totalPages} onClick={() => onPageChange(meta.page + 1)} rightIcon={<ChevronRight className="size-4" aria-hidden="true" />}>
          Next
        </Button>
      </div>
    </nav>
  );
}
