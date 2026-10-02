// Settings → Tuition & fees: the school's "Tuition Fee Options" table and the
// cross-enrollment fee. Changes apply to fees applied FROM NOW ON; charges
// already on an enrollment are not changed.
import { useState, type FormEvent } from "react";
import { Badge } from "@/components/badge/Badge";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { TextInput } from "@/components/form/TextInput";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useApi } from "@/hooks/useApi";
import { useFormErrors } from "@/hooks/useFormErrors";
import { usePrograms } from "@/hooks/useLookups";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { feeService, type FeeScheduleInput } from "@/services/fee.service";
import type { FeeSchedule } from "@/types";
import { formatMoney } from "@/utils/format";
import { allYearLevelOptions } from "@/utils/labels";
import { ReferenceTable, type FormValues } from "./ReferenceTable";

const amount = (value: FormValues[string]) => (typeof value === "string" && value.trim() !== "" ? Number(value) : 0);

export function FeesPanel() {
  const { data, loading, error, reload } = useApi(() => feeService.list(), []);
  const programs = usePrograms();
  const programOptions = (programs.data ?? []).map((program) => ({ value: String(program.id), label: `${program.code} — ${program.name}` }));

  return (
    <div className="space-y-6">
      <Alert tone="info">
        Changes here are used the next time staff applies tuition fees to an enrollment. Charges already applied are not changed.
      </Alert>

      <ReferenceTable<FeeSchedule>
        title="Tuition fee options"
        description="Per term for college (units × rate + miscellaneous fee). Senior High is per school year."
        entityLabel="fee row"
        rows={data?.schedules}
        loading={loading}
        error={error}
        reload={reload}
        columns={[
          { header: "Program", primary: true, cell: (row) => <span className="font-medium">{`${row.programCode} ${row.yearLevelLabel}`}</span> },
          { header: "Units", align: "right", cell: (row) => (row.annualTuition === null ? row.units : "—") },
          {
            header: "Payments",
            hideOnMobile: true,
            cell: (row) =>
              row.annualTuition === null ? (
                <span className="text-xs text-ink-muted tabular-nums">
                  {[row.downPayment, row.prelimPayment, row.midtermPayment].map((value) => formatMoney(value)).join(" · ")} · {formatMoney(row.finalPayment)}
                </span>
              ) : (
                <span className="text-xs text-ink-muted">Whole year · free with voucher</span>
              ),
          },
          { header: "Total", align: "right", cell: (row) => <span className="font-medium tabular-nums">{formatMoney(row.total)}</span> },
          { header: "Status", cell: (row) => <Badge tone={row.isActive ? "success" : "neutral"}>{row.isActive ? "Active" : "Inactive"}</Badge> },
        ]}
        fields={[
          { name: "programId", label: "Program", type: "select", options: programOptions, required: true, wide: true },
          { name: "yearLevel", label: "Year level", type: "select", options: allYearLevelOptions(programs.data), required: true },
          { name: "annualTuition", label: "Whole-year tuition (₱)", type: "number", hint: "Senior High only. Leave empty for college." },
          { name: "units", label: "Units", type: "number", hint: "College: units per term." },
          { name: "ratePerUnit", label: "Rate per unit (₱)", type: "number" },
          { name: "miscFee", label: "Miscellaneous fee (₱)", type: "number" },
          { name: "downPayment", label: "Down payment (₱)", type: "number" },
          { name: "prelimPayment", label: "Prelim payment (₱)", type: "number" },
          { name: "midtermPayment", label: "Midterm payment (₱)", type: "number", hint: "The final payment is whatever remains." },
          { name: "earlyBirdDiscount", label: "Early-bird discount (₱)", type: "number", hint: "Paid 1 month before the term starts." },
          { name: "cashDiscount", label: "Cash discount (₱)", type: "number", hint: "Paid up to the first day of classes." },
          { name: "isActive", label: "Active (can be applied to enrollments)", type: "checkbox" },
        ]}
        toForm={(row) => ({
          programId: String(row?.programId ?? ""),
          yearLevel: String(row?.yearLevel ?? ""),
          annualTuition: row?.annualTuition === null || row === null ? "" : String(row.annualTuition),
          units: String(row?.units ?? 0),
          ratePerUnit: String(row?.ratePerUnit ?? 320),
          miscFee: String(row?.miscFee ?? 2500),
          downPayment: String(row?.downPayment ?? 2000),
          prelimPayment: String(row?.prelimPayment ?? 0),
          midtermPayment: String(row?.midtermPayment ?? 0),
          earlyBirdDiscount: String(row?.earlyBirdDiscount ?? 1000),
          cashDiscount: String(row?.cashDiscount ?? 500),
          isActive: row?.isActive ?? true,
        })}
        toPayload={(values): FeeScheduleInput => ({
          programId: Number(values.programId),
          yearLevel: Number(values.yearLevel),
          annualTuition: typeof values.annualTuition === "string" && values.annualTuition.trim() !== "" ? Number(values.annualTuition) : null,
          units: amount(values.units),
          ratePerUnit: amount(values.ratePerUnit),
          miscFee: amount(values.miscFee),
          downPayment: amount(values.downPayment),
          prelimPayment: amount(values.prelimPayment),
          midtermPayment: amount(values.midtermPayment),
          earlyBirdDiscount: amount(values.earlyBirdDiscount),
          cashDiscount: amount(values.cashDiscount),
          isActive: Boolean(values.isActive),
        })}
        create={(payload) => feeService.create(payload as FeeScheduleInput)}
        update={(id, payload) => feeService.update(id, payload as FeeScheduleInput)}
      />

      {data && <CrossEnrollmentFeeCard key={data.crossEnrollmentFee} initial={data.crossEnrollmentFee} onSaved={reload} />}
    </div>
  );
}

function CrossEnrollmentFeeCard({ initial, onSaved }: { initial: string; onSaved: () => void }) {
  const toast = useToast();
  const [value, setValue] = useState(String(Number(initial)));
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await feeService.updateCrossEnrollmentFee(Number(value));
      toast.success("Cross-enrollment fee saved");
      onSaved();
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Cross-enrollment fee" description="Charged per subject of 3 units, cash basis only — optional when adding an irregular student's extra subject." />
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3" noValidate>
          <TextInput label="Amount per subject (₱)" type="number" min="0" step="0.01" inputMode="decimal" className="w-56" value={value} onChange={(event) => setValue(event.target.value)} error={errors.amount} />
          <Button type="submit" loading={saving}>
            Save
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}
