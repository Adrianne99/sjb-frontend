// Irregular students: subjects taken with ANOTHER section, on top of their own
// section's classes. Added classes appear on the student's schedule and on that
// class's grade sheet. Clashing classes cannot be added (checked by the server).
// Staff can also charge the cross-enrollment fee (₱2,500 per subject, cash basis).
import { CalendarPlus, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/badge/Badge";
import { Checkbox } from "@/components/form/Checkbox";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { Button, IconButton } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { enrollmentService } from "@/services/enrollment.service";
import { feeService } from "@/services/fee.service";
import type { AvailableClass, ExtraSubject, Schedule } from "@/types";
import { classLocation, formatMoney, formatTimeRange } from "@/utils/format";
import { DAY_LABELS } from "@/utils/labels";

function SlotList({ slots }: { slots: Schedule[] }) {
  return (
    <p className="text-xs text-ink-muted">
      {slots.map((slot) => `${DAY_LABELS[slot.dayOfWeek].slice(0, 3)} ${formatTimeRange(slot.startTime, slot.endTime)} · ${classLocation(slot)}`).join("  |  ")}
    </p>
  );
}

interface ExtraSubjectsEditorProps {
  enrollmentId: number;
  canEdit: boolean;
  /** Can also add charges (shows the cross-enrollment fee option). */
  canChargeFee?: boolean;
  /** Called after a cross-enrollment fee was charged, so the balance can reload. */
  onFeeCharged?: () => void;
  /** Called after any subject is added or removed (e.g. to update the units for tuition). */
  onChanged?: () => void;
}

export function ExtraSubjectsEditor({ enrollmentId, canEdit, canChargeFee = false, onFeeCharged, onChanged }: ExtraSubjectsEditorProps) {
  const toast = useToast();
  const extras = useApi(() => enrollmentService.extraSubjects(enrollmentId), [enrollmentId]);
  const [picking, setPicking] = useState(false);
  const [removing, setRemoving] = useState<ExtraSubject | null>(null);
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      const response = await enrollmentService.removeExtraSubject(enrollmentId, removing.id);
      extras.setData(response.data);
      onChanged?.();
      toast.success(`${removing.subject.code} removed from the schedule`);
      setRemoving(null);
    } catch (error) {
      toast.error("Could not remove", getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="extra-subjects-title">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h3 id="extra-subjects-title" className="text-base font-semibold">
            Extra subjects (irregular)
          </h3>
          <p className="text-xs text-ink-muted">Subjects this student takes with another section, in addition to their own section's classes.</p>
        </div>
        {canEdit && !picking && (
          <Button variant="ghost" size="sm" onClick={() => setPicking(true)} leftIcon={<CalendarPlus className="size-4" aria-hidden="true" />}>
            Add subject
          </Button>
        )}
      </div>

      {extras.loading ? (
        <p className="flex items-center gap-2 py-3 text-sm text-ink-muted">
          <Spinner size="sm" /> Loading...
        </p>
      ) : (extras.data ?? []).length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong px-4 py-3 text-sm text-ink-muted">No extra subjects — this student follows their section's schedule.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {extras.data!.map((extra) => (
            <li key={extra.id} className="flex items-start justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  <span className="text-primary-700">{extra.subject.code}</span> · {extra.subject.name}{" "}
                  <Badge tone="gold" className="ml-1">
                    with {extra.section.name}
                  </Badge>
                </p>
                <SlotList slots={extra.slots} />
              </div>
              {canEdit && (
                <IconButton
                  label={extra.hasGrade ? `${extra.subject.code} has a grade and cannot be removed` : `Remove ${extra.subject.code}`}
                  size="sm"
                  disabled={extra.hasGrade}
                  onClick={() => setRemoving(extra)}
                >
                  <Trash2 className="size-4 text-danger-600" aria-hidden="true" />
                </IconButton>
              )}
            </li>
          ))}
        </ul>
      )}

      {picking && (
        <ClassPicker
          enrollmentId={enrollmentId}
          canChargeFee={canChargeFee}
          onCancel={() => setPicking(false)}
          onAdded={(list, charged) => {
            extras.setData(list);
            setPicking(false);
            onChanged?.();
            if (charged) onFeeCharged?.();
          }}
        />
      )}

      <ConfirmDialog
        open={removing !== null}
        title="Remove this subject?"
        description={removing ? `${removing.subject.code} with ${removing.section.name} will be removed from the student's schedule.` : ""}
        confirmLabel="Remove"
        tone="danger"
        loading={busy}
        onCancel={() => setRemoving(null)}
        onConfirm={remove}
      />
    </section>
  );
}

interface ClassPickerProps {
  enrollmentId: number;
  canChargeFee: boolean;
  onCancel: () => void;
  onAdded: (list: ExtraSubject[], chargedFee: boolean) => void;
}

function ClassPicker({ enrollmentId, canChargeFee, onCancel, onAdded }: ClassPickerProps) {
  const toast = useToast();
  const { data, loading, error } = useApi(() => enrollmentService.availableClasses(enrollmentId), [enrollmentId]);
  const fees = useApi(() => (canChargeFee ? feeService.list() : Promise.resolve(null)), [canChargeFee]);
  const [chargeFee, setChargeFee] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  const rows = (data ?? []).filter((row) => `${row.subject.code} ${row.subject.name} ${row.section.name}`.toLowerCase().includes(search.trim().toLowerCase()));

  async function add(row: AvailableClass) {
    const key = `${row.section.id}-${row.subject.id}`;
    setAdding(key);
    try {
      const response = await enrollmentService.addExtraSubject(enrollmentId, { sectionId: row.section.id, subjectId: row.subject.id, chargeCrossEnrollmentFee: chargeFee });
      toast.success(`${row.subject.code} added`, `The student now attends it with ${row.section.name}.${chargeFee ? " Cross-enrollment fee charged." : ""}`);
      onAdded(response.data, chargeFee);
    } catch (addError) {
      toast.error("Could not add the subject", getErrorMessage(addError));
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-primary-200 bg-primary-50/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <label htmlFor="class-search" className="sr-only">
          Search classes
        </label>
        <input
          id="class-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search subject or section..."
          className="h-9 min-w-0 flex-1 rounded-md border border-border-strong bg-surface px-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
        />
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Close
        </Button>
      </div>
      {canChargeFee && (
        <Checkbox
          className="mb-3"
          label={`Charge the cross-enrollment fee${fees.data ? ` (${formatMoney(fees.data.crossEnrollmentFee)})` : ""}`}
          description="Per subject of 3 units, cash basis only. Leave unchecked if the subject is already part of the student's tuition."
          checked={chargeFee}
          onChange={(event) => setChargeFee(event.target.checked)}
        />
      )}
      {loading ? (
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <Spinner size="sm" /> Loading classes for this term...
        </p>
      ) : error ? (
        <p className="text-sm text-danger-700">{error}</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-ink-muted">No other classes are available this term.</p>
      ) : (
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {rows.map((row) => {
            const key = `${row.section.id}-${row.subject.id}`;
            const clashes = row.conflictsWith.length > 0;
            return (
              <li key={key} className="flex items-start justify-between gap-3 rounded-md border border-border bg-surface px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    <span className="text-primary-700">{row.subject.code}</span> · {row.subject.name} — {row.section.name}
                  </p>
                  <SlotList slots={row.slots} />
                  {clashes && (
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-warning-700">
                      <TriangleAlert className="size-3.5" aria-hidden="true" />
                      Overlaps {row.conflictsWith.join(", ")} on the student's schedule
                    </p>
                  )}
                </div>
                <Button size="sm" variant={clashes ? "secondary" : "primary"} disabled={clashes} loading={adding === key} onClick={() => add(row)}>
                  Add
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
