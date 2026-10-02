// "Enroll a student" dialog. Optional charge lines are saved in the SAME
// transaction as the enrollment (all or nothing).
import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Modal } from "@/components/modal/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button, IconButton } from "@/components/ui/Button";
import { useFormErrors } from "@/hooks/useFormErrors";
import { usePrograms, useSections, useTerms } from "@/hooks/useLookups";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { enrollmentService } from "@/services/enrollment.service";
import type { EnrollmentDetail, EnrollmentStatus, StudentSummary } from "@/types";
import { todayISO } from "@/utils/format";
import { ENROLLMENT_STATUS_LABELS, toOptions, yearLevelOptions } from "@/utils/labels";
import { StudentPicker } from "./StudentPicker";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (enrollment: EnrollmentDetail) => void;
  initialStudent?: StudentSummary | null;
}

export function EnrollmentFormModal(props: Props) {
  // Remount the form each time it opens so it starts clean.
  return props.open ? <EnrollmentForm {...props} /> : null;
}

function EnrollmentForm({ onClose, onSaved, initialStudent }: Props) {
  const toast = useToast();
  const { terms, currentTerm } = useTerms();
  const programs = usePrograms();
  const [student, setStudent] = useState<StudentSummary | null>(initialStudent ?? null);
  const [semesterId, setSemesterId] = useState<string>("");
  const [programId, setProgramId] = useState<string>(initialStudent ? String(initialStudent.programId) : "");
  const [yearLevel, setYearLevel] = useState("1");
  const [sectionId, setSectionId] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState(todayISO());
  const [status, setStatus] = useState<EnrollmentStatus>("PENDING");
  const [remarks, setRemarks] = useState("");
  const [lines, setLines] = useState<Array<{ description: string; amount: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { errors, setFromError } = useFormErrors();

  // Only the year levels the program has (Grade 11–12 for Senior High, 1st–2nd year for IT/HRS).
  const program = (programs.data ?? []).find((item) => String(item.id) === programId);
  const levelOptions = yearLevelOptions(program?.yearLevels ?? []);
  const yearLevelValue = levelOptions.some((option) => option.value === yearLevel) ? yearLevel : (levelOptions[0]?.value ?? "");

  const term = terms.find((item) => String(item.id) === (semesterId || String(currentTerm?.id ?? "")));
  const sections = useSections(term?.academicYearId);
  const sectionOptions = (sections.data ?? [])
    .filter((section) => String(section.programId) === programId && String(section.yearLevel) === yearLevelValue)
    .map((section) => ({ value: String(section.id), label: section.name }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!student) {
      setError("Select a student first.");
      return;
    }
    setSaving(true);
    try {
      const response = await enrollmentService.create({
        studentId: student.id,
        semesterId: Number(term?.id),
        programId: Number(programId),
        yearLevel: Number(yearLevelValue),
        sectionId: sectionId ? Number(sectionId) : null,
        enrollmentDate,
        status,
        remarks: remarks || null,
        assessments: lines.filter((line) => line.description || line.amount).map((line) => ({ description: line.description, amount: Number(line.amount) })),
      });
      toast.success("Enrollment saved", `${student.fullName} — ${response.data.termLabel}`);
      onSaved(response.data);
    } catch (saveError) {
      setFromError(saveError); // field messages appear next to the inputs
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Enroll a student"
      size="lg"
      dismissible={!saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="enrollment-form" loading={saving}>
            Save enrollment
          </Button>
        </>
      }
    >
      <form id="enrollment-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <Alert tone="danger">{error}</Alert>}
        <StudentPicker
          value={student}
          onChange={(picked) => {
            setStudent(picked);
            if (picked) setProgramId(String(picked.programId));
          }}
          error={errors.studentId}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Term"
            required
            value={semesterId || String(currentTerm?.id ?? "")}
            onChange={(event) => {
              setSemesterId(event.target.value);
              setSectionId("");
            }}
            options={terms.map((item) => ({ value: String(item.id), label: `${item.label}${item.isCurrent ? " (current)" : ""}` }))}
            error={errors.semesterId}
          />
          <Select
            label="Program"
            required
            placeholder="Select a program"
            value={programId}
            onChange={(event) => {
              setProgramId(event.target.value);
              setSectionId("");
            }}
            options={(programs.data ?? []).map((program) => ({ value: String(program.id), label: `${program.code} — ${program.name}` }))}
            error={errors.programId}
          />
          <Select
            label="Year level"
            required
            value={yearLevelValue}
            onChange={(event) => {
              setYearLevel(event.target.value);
              setSectionId("");
            }}
            options={levelOptions}
            error={errors.yearLevel}
          />
          <Select
            label="Section"
            placeholder={sectionOptions.length ? "No section yet" : "No matching sections"}
            value={sectionId}
            onChange={(event) => setSectionId(event.target.value)}
            options={sectionOptions}
            error={errors.sectionId}
            hint="Required before grades can be encoded."
          />
          <TextInput label="Enrollment date" type="date" required value={enrollmentDate} onChange={(event) => setEnrollmentDate(event.target.value)} error={errors.enrollmentDate} />
          <Select
            label="Status"
            required
            value={status}
            onChange={(event) => setStatus(event.target.value as EnrollmentStatus)}
            options={toOptions(ENROLLMENT_STATUS_LABELS)}
            error={errors.status}
          />
        </div>
        <TextInput label="Remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} maxLength={255} error={errors.remarks} />

        <fieldset className="rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium text-ink-soft">Assessment (charges) — optional</legend>
          {lines.length === 0 && <p className="text-sm text-ink-muted">You can add tuition and fee lines now or later.</p>}
          <ul className="space-y-3">
            {lines.map((line, index) => (
              <li key={index} className="grid grid-cols-[1fr_8rem_auto] items-end gap-2">
                <TextInput
                  label="Description"
                  hideLabel={index > 0}
                  placeholder="e.g. Tuition Fee"
                  value={line.description}
                  onChange={(event) => setLines((current) => current.map((item, i) => (i === index ? { ...item, description: event.target.value } : item)))}
                  error={errors[`assessments.${index}.description`]}
                />
                <TextInput
                  label="Amount (₱)"
                  hideLabel={index > 0}
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={line.amount}
                  onChange={(event) => setLines((current) => current.map((item, i) => (i === index ? { ...item, amount: event.target.value } : item)))}
                  error={errors[`assessments.${index}.amount`]}
                />
                <IconButton label="Remove line" variant="ghost" onClick={() => setLines((current) => current.filter((_, i) => i !== index))}>
                  <Trash2 className="size-4" aria-hidden="true" />
                </IconButton>
              </li>
            ))}
          </ul>
          <Button variant="ghost" size="sm" className="mt-3" leftIcon={<Plus className="size-4" aria-hidden="true" />} onClick={() => setLines((current) => [...current, { description: "", amount: "" }])}>
            Add charge
          </Button>
        </fieldset>
      </form>
    </Modal>
  );
}
