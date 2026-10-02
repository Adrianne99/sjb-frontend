// "View tuition fees (PDF)" button. Opens the fees as a PDF in a new tab. The
// backend builds the PDF from Settings → Tuition & fees, so it always matches
// what the Accounting Office charges.
import { FileText } from "lucide-react";
import { buttonClasses } from "@/components/ui/button-styles";
import { feeService } from "@/services/fee.service";
import { cn } from "@/utils/cn";

export function TuitionFeesButton({ className }: { className?: string }) {
  return (
    <a
      href={feeService.tuitionPdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses("ghost", "lg", false, cn("rounded-full! border border-primary-200 px-7! text-primary-900! hover:bg-primary-50!", className))}
    >
      <FileText className="size-4" aria-hidden="true" />
      View tuition fees (PDF)
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
