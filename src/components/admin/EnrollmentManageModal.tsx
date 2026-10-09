// View and update one enrollment: status/section, and its charge lines.
import { Calculator, FileText, Pencil, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { PaymentScheduleList } from "@/components/finance/PaymentScheduleList";
import { ApplyFeesPanel } from "./ApplyFeesPanel";
import { ExtraSubjectsEditor } from "./ExtraSubjectsEditor";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Modal } from "@/components/modal/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink, IconButton } from "@/components/ui/Button";
import { DescriptionList } from "@/components/ui/DescriptionList";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useFormErrors } from "@/hooks/useFormErrors";
import { usePrograms, useSections } from "@/hooks/useLookups";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { enrollmentService } from "@/services/enrollment.service";
import type { Assessment, EnrollmentDetail, EnrollmentStatus } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate, formatMoney, formatYearLevel } from "@/utils/format";
import { ENROLLMENT_STATUS_LABELS, toOptions, yearLevelOptions } from "@/utils/labels";

export function EnrollmentManageModal({ enrollmentId, onClose, onChanged }: { enrollmentId: number | null; onClose: () => void; onChanged: () => void }) {
  return (
    <Modal open={enrollmentId !== null} onClose={onClose} title="Enrollment details" size="lg">
      {enrollmentId !== null && <EnrollmentManager enrollmentId={enrollmentId} onChanged={onChanged} />}
    </Modal>
  );
}

function EnrollmentManager({ enrollmentId, onChanged }: { enrollmentId: number; onChanged: () => void }) {
  const { can } = useAuth();
  const { data, loading, error, reload, setData } = useApi(() => enrollmentService.get(enrollmentId), [enrollmentId]);
  const [editing, setEditing] = useState(false);
  // Goes up when an extra subject is added/removed, so the tuition units refresh.
  const [extrasVersion, setExtrasVersion] = useState(0);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Loading enrollment..." />;

  const refresh = (updated: EnrollmentDetail) => {
    setData(updated);
    onChanged();
  };

  /** Re-load after the server changed the charges (fees applied, cross-enrollment fee added). */
  const refetch = async () => {
    try {
      refresh(await enrollmentService.get(enrollmentId));
    } catch {
      reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-primary-900">{data.student?.formalName}</p>
          <p className="text-sm text-ink-muted">
            {data.student?.studentNumber} · {data.termLabel}
          </p>
        </div>
        <StatusBadge kind="enrollment" value={data.status} />
      </div>

      {editing ? (
        <EditEnrollmentForm enrollment={data} onCancel={() => setEditing(false)} onSaved={(updated) => {
            refresh(updated);
            setEditing(false);
          }} />
      ) : (
        <div className="rounded-lg border border-border p-4">
          <DescriptionList
            items={[
              { label: "Program", value: `${data.programCode} — ${data.programName}`, wide: true },
              { label: "Year level", value: formatYearLevel(data.yearLevel) },
              { label: "Section", value: data.sectionName ?? "Not assigned" },
              { label: "Enrollment date", value: formatDate(data.enrollmentDate) },
              { label: "Remarks", value: data.remarks },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            {can("enrollments:write") && (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)} leftIcon={<Pencil className="size-4" aria-hidden="true" />}>
                Update status / section
              </Button>
            )}
            {can("grades:read") && (
              <ButtonLink to={`/admin/enrollments/${data.id}/report-card`} variant="primary" size="sm" leftIcon={<FileText className="size-4" aria-hidden="true" />}>
                Report card
              </ButtonLink>
            )}
          </div>
        </div>
      )}

      <ExtraSubjectsEditor enrollmentId={data.id} canEdit={can("enrollments:write")} canChargeFee={can("assessments:write")} onFeeCharged={refetch} onChanged={() => setExtrasVersion((value) => value + 1)} />

      <AssessmentEditor enrollment={data} extrasVersion={extrasVersion} onChanged={refresh} onFeesApplied={refetch} canEdit={can("assessments:write")} />
    </div>
  );
}

function EditEnrollmentForm({ enrollment, onCancel, onSaved }: { enrollment: EnrollmentDetail; onCancel: () => void; onSaved: (updated: EnrollmentDetail) => void }) {
  const toast = useToast();
  const sections = useSections(enrollment.academicYearId);
  const programs = usePrograms();
  const levelOptions = yearLevelOptions((programs.data ?? []).find((program) => program.id === enrollment.programId)?.yearLevels ?? [enrollment.yearLevel]);
  const [values, setValues] = useState({
    status: enrollment.status,
    yearLevel: String(enrollment.yearLevel),
    sectionId: enrollment.sectionId ? String(enrollment.sectionId) : "",
    enrollmentDate: enrollment.enrollmentDate,
    remarks: enrollment.remarks ?? "",
  });
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  const sectionOptions = (sections.data ?? [])
    .filter((section) => section.programId === enrollment.programId && String(section.yearLevel) === values.yearLevel)
    .map((section) => ({ value: String(section.id), label: section.name }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await enrollmentService.update(enrollment.id, {
        status: values.status,
        yearLevel: Number(values.yearLevel),
        sectionId: values.sectionId ? Number(values.sectionId) : null,
        enrollmentDate: values.enrollmentDate,
        remarks: values.remarks || null,
      });
      toast.success("Enrollment updated");
      onSaved(response.data);
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not update enrollment", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-primary-200 bg-primary-50/40 p-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Status" value={values.status} onChange={(event) => setValues({ ...values, status: event.target.value as EnrollmentStatus })} options={toOptions(ENROLLMENT_STATUS_LABELS)} error={errors.status} />
        <Select label="Year level" value={values.yearLevel} onChange={(event) => setValues({ ...values, yearLevel: event.target.value, sectionId: "" })} options={levelOptions} error={errors.yearLevel} />
        <Select label="Section" placeholder="No section" value={values.sectionId} onChange={(event) => setValues({ ...values, sectionId: event.target.value })} options={sectionOptions} error={errors.sectionId} />
        <TextInput label="Enrollment date" type="date" value={values.enrollmentDate} onChange={(event) => setValues({ ...values, enrollmentDate: event.target.value })} error={errors.enrollmentDate} />
      </div>
      <TextInput label="Remarks" value={values.remarks} onChange={(event) => setValues({ ...values, remarks: event.target.value })} maxLength={255} />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save
        </Button>
      </div>
    </form>
  );
}

function AssessmentEditor({
  enrollment,
  extrasVersion,
  onChanged,
  onFeesApplied,
  canEdit,
}: {
  enrollment: EnrollmentDetail;
  extrasVersion: number;
  onChanged: (updated: EnrollmentDetail) => void;
  onFeesApplied: () => void;
  canEdit: boolean;
}) {
  const toast = useToast();
  const [applyingFees, setApplyingFees] = useState(false);
  // Tuition fees can be applied once, before any charge exists.
  const canApplyFees = canEdit && enrollment.paymentPlan === null && enrollment.assessments.length === 0;
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState({ description: "", amount: "", units: "" });
  /** Set while editing the tuition line: only the units are typed, the amount is units × rate. */
  const [tuitionRate, setTuitionRate] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { errors, setFromError, clear } = useFormErrors();

  function startEdit(item: Assessment | null) {
    clear();
    setEditingId(item ? item.id : "new");
    setTuitionRate(item?.tuitionUnits?.ratePerUnit ?? null);
    setDraft(
      item ? { description: item.description, amount: item.amount, units: String(item.tuitionUnits?.units ?? "") } : { description: "", amount: "", units: "" },
    );
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = { description: draft.description, amount: Number(draft.amount) };
      const response =
        editingId === "new"
          ? await enrollmentService.addAssessment(enrollment.id, body)
          : tuitionRate !== null
            ? await enrollmentService.updateTuitionUnits(enrollment.id, editingId as number, Number(draft.units))
            : await enrollmentService.updateAssessment(enrollment.id, editingId as number, body);
      toast.success(editingId === "new" ? "Charge added" : "Charge updated");
      setEditingId(null);
      onChanged(response.data);
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save the charge", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section aria-labelledby="assessment-title">
      <div className="mb-2 flex items-center justify-between">
        <h3 id="assessment-title" className="text-base font-semibold">
          Assessment &amp; balance
        </h3>
        <div className="flex flex-wrap gap-1">
          {canApplyFees && !applyingFees && (
            <Button variant="secondary" size="sm" onClick={() => setApplyingFees(true)} leftIcon={<Calculator className="size-4" aria-hidden="true" />}>
              Apply tuition fees
            </Button>
          )}
          {canEdit && editingId === null && (
            <Button variant="ghost" size="sm" onClick={() => startEdit(null)} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
              Add charge
            </Button>
          )}
        </div>
      </div>

      {canApplyFees && applyingFees && (
        <div className="mb-3">
          <ApplyFeesPanel enrollment={enrollment} extrasVersion={extrasVersion} onApplied={onFeesApplied} />
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => setApplyingFees(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <caption className="sr-only">Charges for this term</caption>
          <thead className="bg-surface-muted text-xs text-ink-soft">
            <tr>
              <th scope="col" className="px-4 py-2 text-left font-semibold">Description</th>
              <th scope="col" className="px-4 py-2 text-right font-semibold">Amount</th>
              {canEdit && <th scope="col" className="w-12"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {enrollment.assessments.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-ink-muted">
                  No charges assessed yet.
                </td>
              </tr>
            )}
            {enrollment.assessments.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2">{item.description}</td>
                <td className={cn("px-4 py-2 text-right tabular-nums", Number(item.amount) < 0 && "text-success-700")}>{formatMoney(item.amount)}</td>
                {canEdit && (
                  <td className="px-2 py-1 text-right">
                    {/* Discounts come from the payment option and are not edited by hand. */}
                    {Number(item.amount) >= 0 && (
                      <IconButton label={`Edit ${item.description}`} size="sm" onClick={() => startEdit(item)}>
                        <Pencil className="size-4" aria-hidden="true" />
                      </IconButton>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-surface-muted/60 text-sm">
            <tr>
              <th scope="row" className="px-4 py-2 text-left font-medium">Total assessed</th>
              <td className="px-4 py-2 text-right font-medium tabular-nums">{formatMoney(enrollment.balance.totalAssessed)}</td>
              {canEdit && <td />}
            </tr>
            <tr>
              <th scope="row" className="px-4 py-2 text-left font-medium">Payments (recorded)</th>
              <td className="px-4 py-2 text-right font-medium tabular-nums">− {formatMoney(enrollment.balance.totalPaid)}</td>
              {canEdit && <td />}
            </tr>
            <tr className="border-t border-border">
              <th scope="row" className="px-4 py-2 text-left font-semibold text-primary-900">Balance</th>
              <td className="px-4 py-2 text-right font-display font-semibold text-primary-900 tabular-nums">{formatMoney(enrollment.balance.balance)}</td>
              {canEdit && <td />}
            </tr>
          </tfoot>
        </table>
      </div>

      {enrollment.paymentPlan && (
        <div className="mt-3">
          <PaymentScheduleList plan={enrollment.paymentPlan} planLabel={enrollment.paymentPlanLabel} schedule={enrollment.paymentSchedule} />
        </div>
      )}

      {editingId !== null && (
        <form onSubmit={save} className="mt-3 grid gap-3 rounded-lg border border-primary-200 bg-primary-50/40 p-4 sm:grid-cols-[1fr_9rem_auto] sm:items-end" noValidate>
          {tuitionRate !== null ? (
            <>
              {/* Tuition line: type the units only; the amount is calculated (the server does the final math). */}
              <TextInput
                label="Units"
                type="number"
                min="1"
                max="60"
                step="1"
                inputMode="numeric"
                value={draft.units}
                onChange={(event) => setDraft({ ...draft, units: event.target.value })}
                error={errors.units}
                hint={`× ${formatMoney(tuitionRate)} per unit`}
              />
              <div className="pb-2.5 sm:pb-6">
                <p className="text-xs font-medium text-ink-muted">Tuition fee</p>
                <p className="font-display text-lg font-semibold text-primary-900 tabular-nums">
                  {draft.units && Number(draft.units) > 0 ? formatMoney(Number(draft.units) * tuitionRate) : "—"}
                </p>
              </div>
            </>
          ) : (
            <>
              <TextInput label="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} error={errors.description} placeholder="e.g. Laboratory Fee" />
              <TextInput label="Amount (₱)" type="number" min="0" step="0.01" inputMode="decimal" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} error={errors.amount} />
            </>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setEditingId(null)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </div>
          {editingId !== "new" && <Alert tone="info" className="sm:col-span-3">Changes to charges are recorded in the audit log.</Alert>}
        </form>
      )}
    </section>
  );
}
