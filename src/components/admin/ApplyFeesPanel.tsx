// "Apply tuition fees" for one enrollment, using the school's fee table
// (Settings → Tuition & fees). Staff picks the payment option (and the units
// actually taken), sees the server's preview, then applies it. The server
// creates the charge lines; fees can only be applied once per enrollment.
import { Calculator } from "lucide-react";
import { useState } from "react";
import { TextInput } from "@/components/form/TextInput";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { enrollmentService } from "@/services/enrollment.service";
import { feeService } from "@/services/fee.service";
import type { AppliedFees, EnrollmentDetail, PaymentPlan } from "@/types";
import { cn } from "@/utils/cn";
import { formatMoney, formatYearLevel } from "@/utils/format";
import { PAYMENT_PLAN_HINTS, PAYMENT_PLAN_LABELS } from "@/utils/labels";

/** `extrasVersion` changes whenever an extra subject is added or removed, so the units update right away. */
/** "23 units (section) + 5 units from 2 extra subjects × ₱320.00" — explains the automatic number. */
function unitsHint(detail: AppliedFees["unitsDetail"] | undefined, feeTableUnits: number, rate: string) {
  if (!detail) return `Fee table: ${feeTableUnits} units × ${rate}. Units may vary per semester.`;
  const base = `${detail.base} units (${detail.baseSource === "section" ? "own section's subjects" : "fee table"})`;
  const extra = detail.extraSubjects > 0 ? ` + ${detail.extra} units from ${detail.extraSubjects} extra subject${detail.extraSubjects === 1 ? "" : "s"}` : "";
  return `Automatic: ${base}${extra}, × ${rate} per unit. You can type a different number.`;
}

export function ApplyFeesPanel({ enrollment, extrasVersion = 0, onApplied }: { enrollment: EnrollmentDetail; extrasVersion?: number; onApplied: () => void }) {
  const toast = useToast();
  const fees = useApi(() => feeService.list(), []);
  const schedule = fees.data?.schedules.find((row) => row.programId === enrollment.programId && row.yearLevel === enrollment.yearLevel && row.isActive);

  const [plan, setPlan] = useState<PaymentPlan | null>(null);
  const [unitsText, setUnitsText] = useState<string | null>(null); // null = use the automatic units (section + extra subjects)
  const [previewUnits, setPreviewUnits] = useState<number | null>(null);
  const [applying, setApplying] = useState(false);

  const selectedPlan = plan ?? schedule?.plans[0] ?? null;
  const isCollege = schedule?.annualTuition === null;

  // The server calculates the preview, so the numbers shown are exactly what will be charged.
  const preview = useApi(
    async () => (selectedPlan ? (await enrollmentService.applyFees(enrollment.id, { plan: selectedPlan, units: previewUnits, preview: true })).data : null),
    [enrollment.id, selectedPlan, previewUnits, extrasVersion],
  );

  function commitUnits() {
    if (unitsText === null || unitsText.trim() === "") return setPreviewUnits(null);
    const units = Number(unitsText);
    if (Number.isInteger(units) && units >= 0 && units <= 60) setPreviewUnits(units);
  }

  async function apply() {
    if (!selectedPlan) return;
    setApplying(true);
    try {
      const response = await enrollmentService.applyFees(enrollment.id, { plan: selectedPlan, units: previewUnits, preview: false });
      toast.success("Tuition fees applied", `${response.data.planLabel} — ${formatMoney(response.data.total)}`);
      onApplied();
    } catch (error) {
      toast.error("Could not apply the fees", getErrorMessage(error));
    } finally {
      setApplying(false);
    }
  }

  if (fees.loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-muted">
        <Spinner size="sm" /> Loading tuition fee options...
      </p>
    );
  }
  if (fees.error) return <Alert tone="danger">{fees.error}</Alert>;
  if (!schedule) {
    return (
      <Alert tone="warning" title="No tuition fees set up">
        There are no tuition fees for {enrollment.programCode} {formatYearLevel(enrollment.yearLevel)} yet. An administrator can add them in Settings → Tuition &amp; fees.
      </Alert>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-primary-200 bg-primary-50/40 p-4">
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-primary-900">
          <Calculator className="size-4" aria-hidden="true" />
          Apply tuition fees — {schedule.programCode} {schedule.yearLevelLabel}
        </p>
        <p className="text-xs text-ink-muted">Choose the payment option the student picked. Charges are created from the school's fee table.</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-soft">Payment option</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {schedule.plans.map((option) => (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer flex-col gap-1 rounded-md border bg-surface p-3 text-sm",
                selectedPlan === option ? "border-primary-500 ring-2 ring-primary-100" : "border-border hover:border-border-strong",
              )}
            >
              <span className="flex items-center gap-2 font-medium">
                <input type="radio" name="payment-plan" value={option} checked={selectedPlan === option} onChange={() => setPlan(option)} className="accent-primary-600" />
                {PAYMENT_PLAN_LABELS[option]}
              </span>
              <span className="text-xs text-ink-muted">{PAYMENT_PLAN_HINTS[option]}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {isCollege && (
        <TextInput
          label="Units taken this term"
          type="number"
          min="0"
          max="60"
          inputMode="numeric"
          className="max-w-48"
          value={unitsText ?? String(preview.data?.units ?? schedule.units)}
          onChange={(event) => setUnitsText(event.target.value)}
          onBlur={commitUnits}
          hint={unitsHint(preview.data?.unitsDetail, schedule.units, formatMoney(schedule.ratePerUnit))}
        />
      )}

      <div className="rounded-md border border-border bg-surface p-3">
        {preview.loading ? (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Spinner size="sm" /> Calculating...
          </p>
        ) : preview.error ? (
          <p className="text-sm text-danger-700">{preview.error}</p>
        ) : preview.data ? (
          <>
            <dl className="divide-y divide-border text-sm">
              {preview.data.lines.map((line) => (
                <div key={line.description} className="flex justify-between gap-4 py-1.5">
                  <dt className="text-ink-soft">{line.description}</dt>
                  <dd className={cn("tabular-nums", Number(line.amount) < 0 && "text-success-700")}>{formatMoney(line.amount)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 py-1.5 font-semibold text-primary-900">
                <dt>Total to charge</dt>
                <dd className="tabular-nums">{formatMoney(preview.data.total)}</dd>
              </div>
            </dl>
            {preview.data.note && <p className="mt-2 text-xs text-ink-muted">{preview.data.note}</p>}
          </>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button onClick={apply} loading={applying} disabled={!preview.data || preview.loading}>
          Apply fees
        </Button>
      </div>
    </div>
  );
}
