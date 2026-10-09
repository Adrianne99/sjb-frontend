// Grade management:  Term -> Class (subject + section) -> Students -> Grades.
// Grades are saved as DRAFT and only become visible to students when PUBLISHED.
//
// The same page is "My Classes" for teachers (<GradesPage teacher />): they only
// get their own classes (from /api/teaching), save drafts and "Submit for review";
// staff publish them or return them with a note. Teachers also take attendance.
// Everyone can print the class list or download it as a spreadsheet.
// Published grades (e.g. an INC that is later completed) are changed with the
// Edit / Complete INC button — a reason is required and every change is logged.
import { ArrowLeft, Download, History, Lock, Pencil, Printer, Save, Send, Undo2, Upload } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PrintableClassList } from "@/components/admin/ClassListExport";
import { ReturnGradesModal, SubmissionBadge, SubmissionBanner } from "@/components/admin/GradeReview";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card, CardHeader } from "@/components/card/Card";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Textarea } from "@/components/form/Textarea";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { Modal } from "@/components/modal/Modal";
import { DataTable } from "@/components/table/DataTable";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/badge/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useTerms } from "@/hooks/useLookups";
import { useQueryState } from "@/hooks/useQueryState";
import { useToast } from "@/hooks/useToast";
import { ApiError, getErrorMessage } from "@/services/api";
import { gradeService, type ClassSelector, type GradeEntry, type GradeSource } from "@/services/grade.service";
import { teachingService } from "@/services/teaching.service";
import type { ClassOffering, ClassRoster, Grade, GradeRemark } from "@/types";
import { downloadClassCsv } from "@/utils/class-list";
import { formatDateTime } from "@/utils/format";
import { AttendancePanel } from "./teacher/AttendancePanel";

export default function GradesPage({ teacher = false }: { teacher?: boolean }) {
  useDocumentTitle(teacher ? "My Classes" : "Grades");
  const source: GradeSource = teacher ? teachingService : gradeService;
  const { terms, currentTerm } = useTerms();
  const [query, setQuery, setQueries] = useQueryState({ semesterId: "", sectionId: "", subjectId: "", view: "" });
  const semesterId = Number(query.semesterId || currentTerm?.id || 0);

  const selector: ClassSelector | null = query.sectionId && query.subjectId && semesterId ? { semesterId, sectionId: Number(query.sectionId), subjectId: Number(query.subjectId) } : null;

  return (
    <>
      <div className="no-print">
        {teacher ? (
          <PageHeader title="My Classes" description="Enter grades and save them as drafts, then submit them for review. You can also take attendance." />
        ) : (
          <PageHeader title="Grades" description="Encode grades as drafts, review them, then publish. Students only see published grades." />
        )}
      </div>
      {selector ? (
        <>
          {teacher && (
            <div className="no-print">
              <Tabs<"grades" | "attendance">
                label="Class sections"
                value={query.view === "attendance" ? "attendance" : "grades"}
                onChange={(id) => setQuery("view", id === "grades" ? "" : id)}
                tabs={[
                  { id: "grades", label: "Grades" },
                  { id: "attendance", label: "Attendance" },
                ]}
              />
            </div>
          )}
          {teacher && query.view === "attendance" ? (
            <AttendancePanel selector={selector} onBack={() => setQueries({ sectionId: "", subjectId: "", view: "" })} />
          ) : (
            <GradeSheet source={source} selector={selector} onBack={() => setQueries({ sectionId: "", subjectId: "", view: "" })} />
          )}
        </>
      ) : (
        <ClassPicker
          source={source}
          semesterId={semesterId}
          terms={terms.map((term) => ({ value: String(term.id), label: term.label }))}
          onTermChange={(id) => setQuery("semesterId", id)}
          onPick={(offering) =>
            setQueries({ semesterId: String(semesterId), sectionId: String(offering.section.id), subjectId: String(offering.subject.id) })
          }
        />
      )}
    </>
  );
}

// --- Step 1: choose a class ----------------------------------------------------

function ClassPicker({ source, semesterId, terms, onTermChange, onPick }: { source: GradeSource; semesterId: number; terms: Array<{ value: string; label: string }>; onTermChange: (id: string) => void; onPick: (offering: ClassOffering) => void }) {
  const { data, loading, error, reload } = useApi(() => (semesterId ? source.classes(semesterId) : Promise.resolve([])), [semesterId]);
  const [section, setSection] = useState("");
  const sections = [...new Map((data ?? []).map((offering) => [offering.section.id, offering.section])).values()];
  const rows = (data ?? []).filter((offering) => !section || String(offering.section.id) === section);

  return (
    <Card>
      <CardHeader title="Select a class" description="Classes come from the schedules of the selected term." />
      <div className="grid grid-cols-1 gap-3 border-b border-border p-4 sm:grid-cols-3">
        <Select label="Term" value={String(semesterId || "")} onChange={(event) => onTermChange(event.target.value)} options={terms} />
        <Select label="Section" placeholder="All sections" value={section} onChange={(event) => setSection(event.target.value)} options={sections.map((item) => ({ value: String(item.id), label: item.name }))} />
      </div>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : (
        <DataTable<ClassOffering>
          caption="Classes"
          loading={loading}
          loadingLabel="Loading classes..."
          rows={rows}
          getRowKey={(row) => `${row.section.id}-${row.subject.id}`}
          onRowClick={onPick}
          empty={{ title: "No classes scheduled for this term.", description: "Add schedules first — grades are encoded per scheduled class." }}
          columns={[
            {
              header: "Subject",
              primary: true,
              cell: (row) => (
                <div>
                  <p className="font-medium text-primary-800">{row.subject.code}</p>
                  <p className="text-xs text-ink-muted">{row.subject.name}</p>
                </div>
              ),
            },
            { header: "Section", cell: (row) => row.section.name },
            { header: "Instructor", cell: (row) => row.instructor.fullName },
            {
              header: "Students",
              align: "center",
              cell: (row) => (
                <span>
                  {row.studentCount}
                  {row.irregularCount > 0 && <span className="block text-xs text-gold-700">incl. {row.irregularCount} irregular</span>}
                </span>
              ),
            },
            {
              header: "Progress",
              cell: (row) => (
                <div className="flex flex-wrap gap-1.5">
                  {row.publishedCount > 0 && <Badge tone="success">{row.publishedCount} published</Badge>}
                  {row.draftCount > 0 && <Badge tone="warning">{row.draftCount} draft</Badge>}
                  {row.publishedCount + row.draftCount < row.studentCount && <Badge tone="neutral">{row.studentCount - row.publishedCount - row.draftCount} not encoded</Badge>}
                </div>
              ),
            },
            { header: "Review", cell: (row) => <SubmissionBadge submission={row.submission} />, hideOnMobile: true },
            {
              header: "Actions",
              align: "right",
              cell: (row) => (
                <Button variant="secondary" size="sm" onClick={(event) => {
                  event.stopPropagation();
                  onPick(row);
                }}>
                  Open grade sheet
                </Button>
              ),
            },
          ]}
        />
      )}
    </Card>
  );
}

// --- Step 2: the grade sheet -----------------------------------------------------

type RowState = { grade: string; remark: "" | "INCOMPLETE" | "DROPPED" };

function GradeSheet({ source, selector, onBack }: { source: GradeSource; selector: ClassSelector; onBack: () => void }) {
  const { data, loading, error, reload, setData } = useApi(() => source.roster(selector), [selector.semesterId, selector.sectionId, selector.subjectId]);
  // A new key re-initialises the editor whenever fresh data arrives from the server.
  const [version, setVersion] = useState(0);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Loading class roster..." />;

  return (
    <GradeSheetEditor
      key={version}
      source={source}
      roster={data}
      selector={selector}
      onBack={onBack}
      onRosterChange={(roster) => {
        setData(roster);
        setVersion((value) => value + 1);
      }}
      onReload={() => {
        reload();
        setVersion((value) => value + 1);
      }}
    />
  );
}

function initialRows(roster: ClassRoster): Record<number, RowState> {
  return Object.fromEntries(
    roster.students.map((row) => [
      row.enrollmentId,
      {
        grade: row.grade?.grade !== null && row.grade?.grade !== undefined ? String(row.grade.grade) : "",
        remark: row.grade?.remark === "INCOMPLETE" || row.grade?.remark === "DROPPED" ? row.grade.remark : "",
      },
    ]),
  );
}

function GradeSheetEditor({ source, roster, selector, onBack, onRosterChange, onReload }: { source: GradeSource; roster: ClassRoster; selector: ClassSelector; onBack: () => void; onRosterChange: (roster: ClassRoster) => void; onReload: () => void }) {
  const { can } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState<Record<number, RowState>>(() => initialRows(roster));
  const [saving, setSaving] = useState(false);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [editing, setEditing] = useState<Grade | null>(null);
  const [historyFor, setHistoryFor] = useState<Grade | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const config = roster.gradingConfig;
  const step = config.decimalPlaces === 0 ? 1 : 0.25;
  const initial = initialRows(roster);
  const dirty = roster.students.some((row) => JSON.stringify(rows[row.enrollmentId]) !== JSON.stringify(initial[row.enrollmentId]));
  const draftCount = roster.students.filter((row) => row.grade?.status === "DRAFT").length;
  const isTeacher = can("teaching:own");
  const submission = roster.submission;
  // A teacher's submitted sheet is locked until staff publish it or return it.
  const lockedForReview = isTeacher && submission?.status === "SUBMITTED";
  // Staff encode with "grades:write"; teachers encode drafts for their own classes.
  const canWrite = (can("grades:write") || isTeacher) && !lockedForReview;
  const missingGrades = roster.students.filter((row) => !row.grade).length;

  const update = (enrollmentId: number, change: Partial<RowState>) => setRows((current) => ({ ...current, [enrollmentId]: { ...current[enrollmentId], ...change } }));

  async function save() {
    // Send rows that are not published and have a grade or a special remark.
    const entries: GradeEntry[] = roster.students
      .filter((row) => row.grade?.status !== "PUBLISHED")
      .map((row) => ({ row, state: rows[row.enrollmentId] }))
      .filter(({ state }) => state.grade !== "" || state.remark !== "")
      .map(({ row, state }) => ({
        enrollmentId: row.enrollmentId,
        grade: state.remark ? null : Number(state.grade),
        remark: (state.remark || null) as GradeRemark | null,
      }));

    if (entries.length === 0) {
      toast.info("Nothing to save", "Enter at least one grade.");
      return;
    }
    setSaving(true);
    setErrors({});
    try {
      const response = await source.saveClass(selector, entries);
      toast.success("Draft grades saved", response.message);
      onRosterChange(response.data.roster);
    } catch (saveError) {
      if (saveError instanceof ApiError && Object.keys(saveError.fieldErrors).length) {
        // Map "entries.3.grade" back to the right student row.
        const mapped: Record<string, string> = {};
        for (const [field, message] of Object.entries(saveError.fieldErrors)) {
          const index = Number(field.split(".")[1]);
          if (entries[index]) mapped[entries[index].enrollmentId] = message;
        }
        setErrors(mapped);
        toast.error("Some grades need attention", "Check the highlighted rows.");
      } else {
        toast.error("Could not save grades", getErrorMessage(saveError));
      }
    } finally {
      setSaving(false);
    }
  }

  async function submitForReview() {
    setSubmitting(true);
    try {
      const response = await teachingService.submit(selector);
      toast.success("Submitted for review", response.message);
      setSubmitOpen(false);
      onReload();
    } catch (submitError) {
      toast.error("Could not submit", getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  }

  function printSheet() {
    window.print();
  }

  async function publish() {
    setPublishing(true);
    try {
      const response = await gradeService.publishClass(selector);
      toast.success("Grades published", response.message);
      setPublishOpen(false);
      onReload();
    } catch (publishError) {
      toast.error("Could not publish", getErrorMessage(publishError));
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="size-4" aria-hidden="true" />} className="no-print mb-3">
        All classes
      </Button>

      <Card className="no-print">
        <CardHeader
          title={`${roster.class.subject.code} · ${roster.class.subject.name}`}
          description={`${roster.class.section.name} · ${roster.class.instructor.fullName} · ${roster.class.termLabel} · ${roster.class.subject.units} units`}
          actions={
            <>
              <Button variant="ghost" onClick={printSheet} leftIcon={<Printer className="size-4" aria-hidden="true" />}>
                Print
              </Button>
              <Button variant="ghost" onClick={() => downloadClassCsv(roster)} leftIcon={<Download className="size-4" aria-hidden="true" />}>
                Download CSV
              </Button>
              {canWrite && (
                <Button variant="secondary" onClick={save} loading={saving} disabled={!dirty} leftIcon={<Save className="size-4" aria-hidden="true" />}>
                  Save drafts
                </Button>
              )}
              {canWrite && isTeacher && (
                <Button onClick={() => setSubmitOpen(true)} disabled={dirty || draftCount === 0 || missingGrades > 0} leftIcon={<Upload className="size-4" aria-hidden="true" />}>
                  Submit for review
                </Button>
              )}
              {can("grades:publish") && submission?.status === "SUBMITTED" && (
                <Button variant="secondary" onClick={() => setReturnOpen(true)} leftIcon={<Undo2 className="size-4" aria-hidden="true" />}>
                  Return to teacher
                </Button>
              )}
              {canWrite && can("grades:publish") && (
                <Button onClick={() => setPublishOpen(true)} disabled={dirty || draftCount === 0} leftIcon={<Send className="size-4" aria-hidden="true" />}>
                  Publish {draftCount > 0 ? `(${draftCount})` : ""}
                </Button>
              )}
            </>
          }
        />
        <div className="space-y-2 border-b border-border px-5 py-3 text-sm text-ink-muted">
          <p>
            Grading scale: <strong className="text-ink">{config.scaleLabel}</strong> · Passing: {config.passingGrade} · Remarks (Passed/Failed) are computed by the system when you save.
          </p>
          {dirty && <p className="font-medium text-warning-700">You have unsaved changes. Save them before {isTeacher ? "submitting" : "publishing"}.</p>}
          {isTeacher && canWrite && !dirty && missingGrades > 0 && (
            <p>
              {missingGrades} student(s) have no grade yet. Every student needs a grade (or INC / Dropped) before you can submit for review.
            </p>
          )}
          <SubmissionBanner submission={submission} teacher={isTeacher} />
        </div>

        <DataTable
          caption="Grade sheet"
          rows={roster.students}
          getRowKey={(row) => row.enrollmentId}
          empty={{ title: "No enrolled students in this section.", description: "Only students with an Enrolled or Completed status appear here." }}
          rowClassName={(row) => (errors[row.enrollmentId] ? "bg-danger-50/60" : undefined)}
          columns={[
            {
              header: "Student",
              primary: true,
              cell: (row) => (
                <div>
                  <p className="font-medium">{row.student.formalName}</p>
                  <p className="text-xs text-ink-muted tabular-nums">
                    {row.student.studentNumber}
                    {row.irregular && (
                      <Badge tone="gold" className="ml-2">
                        Irregular · from {row.homeSectionName ?? "no section"}
                      </Badge>
                    )}
                  </p>
                </div>
              ),
            },
            {
              header: "Grade",
              cell: (row) => {
                const state = rows[row.enrollmentId];
                const locked = row.grade?.status === "PUBLISHED" || !canWrite;
                if (locked) return <span className="font-display text-base font-semibold text-primary-900 tabular-nums">{row.grade?.gradeDisplay ?? "—"}</span>;
                return (
                  <div className="w-28">
                    <TextInput
                      label={`Grade for ${row.student.fullName}`}
                      hideLabel
                      type="number"
                      inputMode="decimal"
                      min={config.minGrade}
                      max={config.maxGrade}
                      step={step}
                      value={state.grade}
                      disabled={state.remark !== ""}
                      onChange={(event) => update(row.enrollmentId, { grade: event.target.value })}
                      error={errors[row.enrollmentId]}
                    />
                  </div>
                );
              },
            },
            {
              header: "Special remark",
              cell: (row) => {
                const state = rows[row.enrollmentId];
                if (row.grade?.status === "PUBLISHED" || !canWrite) return <span className="text-ink-muted">—</span>;
                return (
                  <div className="w-40">
                    <Select
                      label={`Special remark for ${row.student.fullName}`}
                      hideLabel
                      value={state.remark}
                      onChange={(event) => update(row.enrollmentId, { remark: event.target.value as RowState["remark"], grade: event.target.value ? "" : state.grade })}
                      options={[
                        { value: "", label: "None" },
                        { value: "INCOMPLETE", label: "Incomplete" },
                        { value: "DROPPED", label: "Dropped" },
                      ]}
                    />
                  </div>
                );
              },
            },
            { header: "Remarks", cell: (row) => (row.grade ? <StatusBadge kind="remark" value={row.grade.remark} /> : <span className="text-xs text-ink-muted">Not encoded</span>) },
            {
              header: "Status",
              cell: (row) => (
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  {row.grade ? <StatusBadge kind="grade" value={row.grade.status} /> : <span className="text-xs text-ink-muted">—</span>}
                  {row.grade?.status === "PUBLISHED" &&
                    (can("grades:edit-published") ? (
                      <Button
                        variant={row.grade.remark === "INCOMPLETE" ? "gold" : "secondary"}
                        size="sm"
                        onClick={() => setEditing(row.grade)}
                        leftIcon={<Pencil className="size-3.5" aria-hidden="true" />}
                        aria-label={`${row.grade.remark === "INCOMPLETE" ? "Complete INC grade" : "Edit published grade"} of ${row.student.fullName}`}
                      >
                        {row.grade.remark === "INCOMPLETE" ? "Complete INC" : "Edit"}
                      </Button>
                    ) : (
                      <Lock className="size-3.5 text-ink-muted" aria-label="Locked — you cannot change published grades" />
                    ))}
                  {row.grade && can("grades:read") && (
                    <IconButton label={`Change history of ${row.student.fullName}'s grade`} size="sm" onClick={() => setHistoryFor(row.grade)}>
                      <History className="size-4" aria-hidden="true" />
                    </IconButton>
                  )}
                </span>
              ),
            },
          ]}
        />
      </Card>

      <PrintableClassList roster={roster} />

      <ConfirmDialog
        open={submitOpen}
        title="Submit these grades for review?"
        description="The Registrar's Office will check and publish them. You can't change them unless they are returned to you."
        confirmLabel="Submit for review"
        loading={submitting}
        onCancel={() => setSubmitOpen(false)}
        onConfirm={submitForReview}
      />
      <ReturnGradesModal
        open={returnOpen}
        selector={selector}
        onClose={() => setReturnOpen(false)}
        onReturned={() => {
          setReturnOpen(false);
          onReload();
        }}
      />

      <ConfirmDialog
        open={publishOpen}
        title="Publish these grades?"
        description={
          <>
            <strong>{draftCount}</strong> draft grade(s) for {roster.class.subject.code} — {roster.class.section.name} will be published.
            <br />
            Published grades will become visible to students. After publishing, changes (such as completing an INC) need a reason and are recorded.
          </>
        }
        confirmLabel="Publish grades"
        loading={publishing}
        onCancel={() => setPublishOpen(false)}
        onConfirm={publish}
      />

      <GradeHistoryModal grade={historyFor} onClose={() => setHistoryFor(null)} />

      <EditPublishedGradeModal
        grade={editing}
        config={config}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          onReload();
        }}
      />
    </>
  );
}

// --- Change a published grade / complete an INC (reason required; audited) ------

function EditPublishedGradeModal({ grade, config, onClose, onSaved }: { grade: Grade | null; config: ClassRoster["gradingConfig"]; onClose: () => void; onSaved: () => void }) {
  const completingInc = grade?.remark === "INCOMPLETE";
  return (
    <Modal open={Boolean(grade)} onClose={onClose} title={completingInc ? "Complete an INC grade" : "Change a published grade"} size="md">
      {grade && <EditPublishedGradeForm key={grade.id} grade={grade} config={config} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function EditPublishedGradeForm({ grade, config, onClose, onSaved }: { grade: Grade; config: ClassRoster["gradingConfig"]; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const completingInc = grade.remark === "INCOMPLETE";
  const [value, setValue] = useState(grade.grade !== null ? String(grade.grade) : "");
  // Completing an INC starts with "None" so the new grade can be typed in.
  const [remark, setRemark] = useState<"" | "INCOMPLETE" | "DROPPED">(grade.remark === "DROPPED" ? "DROPPED" : "");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await gradeService.update(grade.id, { grade: remark ? null : Number(value), remark: remark || null, reason: reason || null });
      toast.success(completingInc ? "INC completed" : "Published grade changed", "The change and your reason were recorded.");
      onSaved();
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not change grade", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-ink-soft">
        {grade.student.formalName} · {grade.subject.code} · currently <strong>{grade.gradeDisplay ?? grade.remark}</strong>
      </p>
      <Alert tone="warning">
        {completingInc
          ? "Enter the final grade now that the student has completed the requirements. Students will see the new grade right away."
          : "Students can already see this grade. Your reason is stored with the change."}
      </Alert>
      <div className="grid grid-cols-2 gap-3">
        <TextInput label="New grade" type="number" min={config.minGrade} max={config.maxGrade} step={config.decimalPlaces === 0 ? 1 : 0.25} value={value} disabled={remark !== ""} onChange={(event) => setValue(event.target.value)} error={errors.grade} />
        <Select
          label="Special remark"
          value={remark}
          onChange={(event) => setRemark(event.target.value as typeof remark)}
          options={[
            { value: "", label: "None" },
            { value: "INCOMPLETE", label: "Incomplete" },
            { value: "DROPPED", label: "Dropped" },
          ]}
        />
      </div>
      <Textarea
        label="Reason for the change"
        required
        rows={3}
        placeholder={completingInc ? "e.g. Submitted the missing project on Oct 5" : "e.g. Correction after re-checking the final exam"}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        error={errors.reason}
        maxLength={255}
      />
      <GradeHistoryList gradeId={grade.id} />
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {completingInc ? "Save final grade" : "Save change"}
        </Button>
      </div>
    </form>
  );
}

// --- Change history of one grade --------------------------------------------------

function GradeHistoryModal({ grade, onClose }: { grade: Grade | null; onClose: () => void }) {
  return (
    <Modal open={Boolean(grade)} onClose={onClose} title="Grade history" description={grade ? `${grade.student.formalName} · ${grade.subject.code}` : undefined} size="md">
      {grade && <GradeHistoryList gradeId={grade.id} />}
    </Modal>
  );
}

function GradeHistoryList({ gradeId }: { gradeId: number }) {
  const { data, loading } = useApi(() => gradeService.history(gradeId), [gradeId]);
  if (loading) return <p className="text-sm text-ink-muted">Loading history...</p>;
  if (!data?.length) return <p className="text-sm text-ink-muted">No individual changes recorded yet (grades saved on the sheet are logged per class).</p>;
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-soft">Previous changes</p>
      <ol className="space-y-2 border-l-2 border-gold-300 pl-4">
        {data.map((entry) => (
          <li key={entry.id} className="text-sm">
            <p className="text-ink">{entry.description}</p>
            <p className="text-xs text-ink-muted">
              {entry.user ?? "System"} · {formatDateTime(entry.createdAt)}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
