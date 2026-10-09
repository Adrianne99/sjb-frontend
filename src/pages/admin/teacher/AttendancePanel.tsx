// Attendance for one of the teacher's classes (My Classes → Attendance tab).
//   1. Pick the date (today by default; no future dates).
//   2. Mark each student Present / Late / Absent / Excused ("Mark all present" helps).
//   3. Save. The totals for the term are shown underneath.
import { ArrowLeft, CheckCheck, Save } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader } from "@/components/card/Card";
import { TextInput } from "@/components/form/TextInput";
import { DataTable } from "@/components/table/DataTable";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import type { ClassSelector } from "@/services/grade.service";
import { teachingService, type AttendanceSheet, type AttendanceStatus } from "@/services/teaching.service";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import { DAY_LABELS } from "@/utils/labels";

const STATUSES: Array<{ value: AttendanceStatus; label: string; short: string; selected: string }> = [
  { value: "PRESENT", label: "Present", short: "P", selected: "bg-success-600 text-white border-success-600" },
  { value: "LATE", label: "Late", short: "L", selected: "bg-warning-600 text-white border-warning-600" },
  { value: "ABSENT", label: "Absent", short: "A", selected: "bg-danger-600 text-white border-danger-600" },
  { value: "EXCUSED", label: "Excused", short: "E", selected: "bg-primary-600 text-white border-primary-600" },
];

/** Today in the Philippines as "YYYY-MM-DD". */
const todayInManila = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

export function AttendancePanel({ selector, onBack }: { selector: ClassSelector; onBack: () => void }) {
  const [date, setDate] = useState(todayInManila());
  const sheet = useApi(() => teachingService.attendance(selector, date), [selector.semesterId, selector.sectionId, selector.subjectId, date]);
  const summary = useApi(() => teachingService.attendanceSummary(selector), [selector.semesterId, selector.sectionId, selector.subjectId]);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="size-4" aria-hidden="true" />} className="mb-3">
        All classes
      </Button>

      <Card>
        <CardHeader
          title="Take attendance"
          description="Mark each student, then save. You can come back and change a date later."
          actions={
            <div className="w-44">
              <TextInput label="Date" type="date" value={date} max={todayInManila()} onChange={(event) => event.target.value && setDate(event.target.value)} />
            </div>
          }
        />
        {sheet.error ? (
          <ErrorState message={sheet.error} onRetry={sheet.reload} />
        ) : sheet.loading || !sheet.data ? (
          <LoadingState label="Loading class list..." />
        ) : (
          <AttendanceEditor
            key={`${sheet.data.date}-${JSON.stringify(sheet.data.students.map((row) => row.status))}`}
            sheet={sheet.data}
            selector={selector}
            onSaved={(saved) => {
              sheet.setData(saved);
              summary.reload();
            }}
          />
        )}
      </Card>

      <Card className="mt-6">
        <CardHeader title="Attendance this term" description={summary.data ? `${summary.data.dates.length} class meeting(s) recorded` : undefined} />
        {summary.error ? (
          <ErrorState message={summary.error} onRetry={summary.reload} />
        ) : (
          <DataTable
            caption="Attendance totals"
            loading={summary.loading}
            rows={summary.data?.students ?? []}
            getRowKey={(row) => row.enrollmentId}
            empty={{ title: "No students in this class." }}
            columns={[
              {
                header: "Student",
                primary: true,
                cell: (row) => (
                  <div>
                    <p className="font-medium">{row.student.formalName}</p>
                    <p className="text-xs text-ink-muted tabular-nums">{row.student.studentNumber}</p>
                  </div>
                ),
              },
              { header: "Present", align: "right", cell: (row) => <span className="tabular-nums">{row.present}</span> },
              { header: "Late", align: "right", cell: (row) => <span className="tabular-nums">{row.late}</span> },
              { header: "Absent", align: "right", cell: (row) => <span className={cn("tabular-nums", row.absent > 0 && "font-semibold text-danger-700")}>{row.absent}</span> },
              { header: "Excused", align: "right", cell: (row) => <span className="tabular-nums">{row.excused}</span> },
            ]}
          />
        )}
      </Card>
    </>
  );
}

function AttendanceEditor({ sheet, selector, onSaved }: { sheet: AttendanceSheet; selector: ClassSelector; onSaved: (sheet: AttendanceSheet) => void }) {
  const toast = useToast();
  const [marks, setMarks] = useState<Record<number, AttendanceStatus | null>>(() => Object.fromEntries(sheet.students.map((row) => [row.enrollmentId, row.status])));
  const [saving, setSaving] = useState(false);
  const changed = sheet.students.some((row) => marks[row.enrollmentId] !== row.status);
  const unmarked = sheet.students.filter((row) => !marks[row.enrollmentId]).length;

  function markAllPresent() {
    setMarks((current) => Object.fromEntries(sheet.students.map((row) => [row.enrollmentId, current[row.enrollmentId] ?? "PRESENT"])));
  }

  async function save() {
    const entries = sheet.students
      .filter((row) => marks[row.enrollmentId])
      .map((row) => ({ enrollmentId: row.enrollmentId, status: marks[row.enrollmentId]! }));
    if (entries.length === 0) {
      toast.info("Nothing to save", "Mark at least one student.");
      return;
    }
    setSaving(true);
    try {
      const response = await teachingService.saveAttendance(selector, sheet.date, entries);
      toast.success("Attendance saved", formatDate(sheet.date, "long"));
      onSaved(response.data);
    } catch (error) {
      toast.error("Could not save attendance", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="space-y-3 border-b border-border px-5 py-3">
        {!sheet.meetsOnThisDay && (
          <Alert tone="warning">
            This class usually meets on {sheet.meetingDays.map((day) => DAY_LABELS[day]).join(" and ") || "no set day"}. You can still take attendance (for example, for a make-up class).
          </Alert>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-muted">{unmarked > 0 ? `${unmarked} student(s) not marked yet.` : "Everyone is marked."}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={markAllPresent} leftIcon={<CheckCheck className="size-4" aria-hidden="true" />}>
              Mark the rest present
            </Button>
            <Button size="sm" onClick={save} loading={saving} disabled={!changed} leftIcon={<Save className="size-4" aria-hidden="true" />}>
              Save attendance
            </Button>
          </div>
        </div>
      </div>

      <DataTable
        caption={`Attendance for ${sheet.date}`}
        rows={sheet.students}
        getRowKey={(row) => row.enrollmentId}
        empty={{ title: "No students in this class." }}
        columns={[
          {
            header: "Student",
            primary: true,
            cell: (row) => (
              <div>
                <p className="font-medium">{row.student.formalName}</p>
                <p className="text-xs text-ink-muted tabular-nums">{row.student.studentNumber}</p>
              </div>
            ),
          },
          {
            header: "Attendance",
            cell: (row) => (
              <div role="radiogroup" aria-label={`Attendance of ${row.student.fullName}`} className="flex gap-1.5">
                {STATUSES.map((status) => {
                  const selected = marks[row.enrollmentId] === status.value;
                  return (
                    <button
                      key={status.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={status.label}
                      title={status.label}
                      onClick={() => setMarks((current) => ({ ...current, [row.enrollmentId]: status.value }))}
                      className={cn(
                        "flex h-9 min-w-9 items-center justify-center rounded-md border px-2 text-sm font-semibold transition-colors sm:min-w-20",
                        selected ? status.selected : "border-border-strong bg-surface text-ink-soft hover:bg-surface-muted",
                      )}
                    >
                      <span className="sm:hidden">{status.short}</span>
                      <span className="hidden sm:inline">{status.label}</span>
                    </button>
                  );
                })}
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
