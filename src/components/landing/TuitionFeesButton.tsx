// "View tuition fees (PDF)" button. Opens the fees as a PDF in a new tab. The
// backend builds the PDF from Settings → Tuition & fees, so it always matches
// what the Accounting Office charges.
import { FileText } from "lucide-react";
import { feeService } from "@/services/fee.service";
import { cn } from "@/utils/cn";

export function TuitionFeesButton({ className }: { className?: string }) {
  return (
    <a
      href={feeService.tuitionPdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border border-primary-300 bg-surface px-6 text-sm font-semibold text-primary-900 transition-colors hover:border-primary-500 hover:bg-primary-50",
        className,
      )}
    >
      <FileText className="size-4" aria-hidden="true" />
      View tuition fees (PDF)
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
