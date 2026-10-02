// A term's payment schedule (Down payment, Prelim, Midterm, Final — or one full
// payment). The backend already applied the recorded payments to each part.
import { Badge, type BadgeTone } from "@/components/badge/Badge";
import type { Installment, PaymentPlan } from "@/types";
import { formatMoney } from "@/utils/format";

const STATUS: Record<Installment["status"], { label: string; tone: BadgeTone }> = {
  PAID: { label: "Paid", tone: "success" },
  PARTIAL: { label: "Partly paid", tone: "warning" },
  DUE: { label: "To pay", tone: "neutral" },
};

export function PaymentScheduleList({ plan, planLabel, schedule }: { plan: PaymentPlan | null; planLabel: string | null; schedule: Installment[] }) {
  if (!planLabel) return null;

  return (
    <div>
      <p className="mb-2 text-sm">
        <span className="text-ink-muted">Payment option:</span> <span className="font-medium text-ink">{planLabel}</span>
      </p>
      {schedule.length === 0 ? (
        <p className="text-sm text-ink-muted">{plan === "SHS_VOUCHER" ? "Tuition is free with a Senior High voucher." : "No tuition to pay for this term."}</p>
      ) : (
        <ol className="divide-y divide-border rounded-lg border border-border bg-surface text-sm">
          {schedule.map((part) => (
            <li key={part.label} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2">
              <span className="min-w-0 flex-1 text-ink-soft">{part.label}</span>
              <span className="font-medium tabular-nums">{formatMoney(part.amount)}</span>
              <span className="flex w-full items-center justify-end gap-2 sm:w-auto">
                {part.status === "PARTIAL" && <span className="text-xs text-ink-muted tabular-nums">{formatMoney(part.remaining)} left</span>}
                <Badge tone={STATUS[part.status].tone}>{STATUS[part.status].label}</Badge>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
