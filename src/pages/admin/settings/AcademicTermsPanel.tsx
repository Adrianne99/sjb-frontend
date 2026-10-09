// Academic years and their terms; choose which term is "current".
import { CalendarPlus, CircleCheck, Pencil, Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Badge } from "@/components/badge/Badge";
import { Card, CardHeader } from "@/components/card/Card";
import { TextInput } from "@/components/form/TextInput";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { Modal } from "@/components/modal/Modal";
import { Button, IconButton } from "@/components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useFormErrors } from "@/hooks/useFormErrors";
import { invalidateLookups } from "@/hooks/useLookups";
import { useToast } from "@/hooks/useToast";
import { academicService } from "@/services/academic.service";
import { getErrorMessage } from "@/services/api";
import type { AcademicYear, Semester } from "@/types";
import { formatDate } from "@/utils/format";

type Editing = { kind: "year"; year: AcademicYear | null } | { kind: "term"; year: AcademicYear; term: Semester | null };

export function AcademicTermsPanel() {
  const toast = useToast();
  const { data, loading, error, reload } = useApi(() => academicService.academicYears(), []);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [makeCurrent, setMakeCurrent] = useState<Semester | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => {
    invalidateLookups();
    reload();
  };
  const closeAndRefresh = () => {
    setEditing(null);
    refresh();
  };

  async function confirmCurrent() {
    if (!makeCurrent) return;
    setBusy(true);
    try {
      const response = await academicService.setCurrentSemester(makeCurrent.id);
      toast.success("Current term changed", response.message);
      setMakeCurrent(null);
      refresh();
    } catch (currentError) {
      toast.error("Could not change the current term", getErrorMessage(currentError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title="Academic years & terms"
        description="The current term is used by default across enrollment, grades, schedules and the student portal."
        actions={
          <Button size="sm" onClick={() => setEditing({ kind: "year", year: null })} leftIcon={<CalendarPlus className="size-4" aria-hidden="true" />}>
            Add academic year
          </Button>
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <LoadingState label="Loading academic years..." />
      ) : data.length === 0 ? (
        <EmptyState title="No academic years yet." description="Add the first academic year, then its terms." />
      ) : (
        <ul className="divide-y divide-border">
          {data.map((year) => (
            <li key={year.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-display font-semibold text-primary-900">A.Y. {year.name}</p>
                  <p className="text-xs text-ink-muted">
                    {formatDate(year.startDate)} – {formatDate(year.endDate)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing({ kind: "term", year, term: null })} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
                    Add term
                  </Button>
                  <IconButton label={`Edit academic year ${year.name}`} size="sm" onClick={() => setEditing({ kind: "year", year })}>
                    <Pencil className="size-4" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {year.semesters.map((term) => (
                  <li key={term.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{term.name}</p>
                      <p className="text-xs text-ink-muted">{term.startDate ? `${formatDate(term.startDate)} – ${formatDate(term.endDate)}` : "No dates set"}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {term.isCurrent ? (
                        <Badge tone="gold" icon={CircleCheck}>
                          Current
                        </Badge>
                      ) : (
                        <Button variant="ghost" size="sm" onClick={() => setMakeCurrent(term)}>
                          Set current
                        </Button>
                      )}
                      <IconButton label={`Edit ${term.label}`} size="sm" onClick={() => setEditing({ kind: "term", year, term })}>
                        <Pencil className="size-4" aria-hidden="true" />
                      </IconButton>
                    </div>
                  </li>
                ))}
                {year.semesters.length === 0 && <li className="text-sm text-ink-muted">No terms yet.</li>}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.kind === "year" ? (editing.year ? "Edit academic year" : "Add academic year") : editing?.term ? "Edit term" : "Add term"} size="sm">
        {editing?.kind === "year" && <YearForm key={editing.year?.id ?? "new"} year={editing.year} onDone={closeAndRefresh} />}
        {editing?.kind === "term" && <TermForm key={editing.term?.id ?? "new"} year={editing.year} term={editing.term} onDone={closeAndRefresh} />}
      </Modal>

      <ConfirmDialog
        open={makeCurrent !== null}
        title="Change the current term?"
        description={`${makeCurrent?.label} will become the default term for enrollment, grades, schedules and the student portal.`}
        confirmLabel="Set as current"
        loading={busy}
        onCancel={() => setMakeCurrent(null)}
        onConfirm={confirmCurrent}
      />
    </Card>
  );
}

function YearForm({ year, onDone }: { year: AcademicYear | null; onDone: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState({ name: year?.name ?? "", startDate: year?.startDate ?? "", endDate: year?.endDate ?? "" });
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (year) await academicService.updateAcademicYear(year.id, values);
      else await academicService.createAcademicYear(values);
      toast.success("Academic year saved");
      onDone();
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <TextInput label="Name" placeholder="2027-2028" required value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} error={errors.name} />
      <div className="grid grid-cols-2 gap-3">
        <TextInput label="Start date" type="date" required value={values.startDate} onChange={(event) => setValues({ ...values, startDate: event.target.value })} error={errors.startDate} />
        <TextInput label="End date" type="date" required value={values.endDate} onChange={(event) => setValues({ ...values, endDate: event.target.value })} error={errors.endDate} />
      </div>
      <Button type="submit" fullWidth loading={saving}>
        Save
      </Button>
    </form>
  );
}

function TermForm({ year, term, onDone }: { year: AcademicYear; term: Semester | null; onDone: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState({
    name: term?.name ?? (year.semesters.length === 0 ? "First Semester" : year.semesters.length === 1 ? "Second Semester" : "Summer"),
    termNumber: String(term?.termNumber ?? year.semesters.length + 1),
    startDate: term?.startDate ?? "",
    endDate: term?.endDate ?? "",
  });
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const body = { academicYearId: year.id, name: values.name, termNumber: Number(values.termNumber), startDate: values.startDate || null, endDate: values.endDate || null };
    try {
      if (term) await academicService.updateSemester(term.id, body);
      else await academicService.createSemester(body);
      toast.success("Term saved");
      onDone();
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-ink-muted">A.Y. {year.name}</p>
      <div className="grid grid-cols-[1fr_6rem] gap-3">
        <TextInput label="Term name" required value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} error={errors.name} />
        <TextInput label="Order" type="number" min="1" max="4" required value={values.termNumber} onChange={(event) => setValues({ ...values, termNumber: event.target.value })} error={errors.termNumber} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextInput label="Start date" type="date" value={values.startDate ?? ""} onChange={(event) => setValues({ ...values, startDate: event.target.value })} error={errors.startDate} />
        <TextInput label="End date" type="date" value={values.endDate ?? ""} onChange={(event) => setValues({ ...values, endDate: event.target.value })} error={errors.endDate} />
      </div>
      <Button type="submit" fullWidth loading={saving}>
        Save
      </Button>
    </form>
  );
}
