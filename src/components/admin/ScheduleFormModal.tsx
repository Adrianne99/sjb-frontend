// Add / edit a class schedule. The backend rejects instructor, room and section
// clashes; when that happens we list exactly which classes conflict.
import { TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Modal } from "@/components/modal/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useInstructors, useRooms, useSections, useSubjects, useTerms } from "@/hooks/useLookups";
import { useToast } from "@/hooks/useToast";
import { ApiError, getErrorMessage } from "@/services/api";
import { scheduleService, type ScheduleInput } from "@/services/schedule.service";
import type { ClassMode, DayOfWeek, Schedule, ScheduleConflict } from "@/types";
import { classLocation, formatTimeRange } from "@/utils/format";
import { CLASS_MODE_LABELS, DAY_LABELS, toOptions } from "@/utils/labels";

interface Props {
  open: boolean;
  /** Pass a schedule to edit it; omit to create a new one. */
  schedule?: Schedule | null;
  defaultSemesterId?: number;
  defaultSectionId?: number;
  onClose: () => void;
  onSaved: () => void;
}

export function ScheduleFormModal(props: Props) {
  return props.open ? <ScheduleForm {...props} /> : null;
}

function ScheduleForm({ schedule, defaultSemesterId, defaultSectionId, onClose, onSaved }: Props) {
  const toast = useToast();
  const { terms, currentTerm } = useTerms();
  const subjects = useSubjects();
  const instructors = useInstructors();
  const rooms = useRooms();

  const [values, setValues] = useState({
    semesterId: String(schedule?.semesterId ?? defaultSemesterId ?? currentTerm?.id ?? ""),
    sectionId: String(schedule?.section.id ?? defaultSectionId ?? ""),
    subjectId: String(schedule?.subject.id ?? ""),
    instructorId: String(schedule?.instructor.id ?? ""),
    mode: (schedule?.mode ?? "FACE_TO_FACE") as ClassMode,
    roomId: String(schedule?.room?.id ?? ""),
    dayOfWeek: (schedule?.dayOfWeek ?? "MONDAY") as DayOfWeek,
    startTime: schedule?.startTime ?? "08:00",
    endTime: schedule?.endTime ?? "09:30",
  });
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { errors, setFromError } = useFormErrors();

  const semesterId = values.semesterId || String(currentTerm?.id ?? "");
  const term = terms.find((item) => String(item.id) === semesterId);
  const sections = useSections(term?.academicYearId);
  const set = (field: keyof typeof values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setConflicts([]);
    setError(null);
    setSaving(true);
    const input: ScheduleInput = {
      semesterId: Number(semesterId),
      sectionId: Number(values.sectionId),
      subjectId: Number(values.subjectId),
      instructorId: Number(values.instructorId),
      mode: values.mode,
      roomId: values.mode === "ONLINE" || !values.roomId ? null : Number(values.roomId),
      dayOfWeek: values.dayOfWeek,
      startTime: values.startTime,
      endTime: values.endTime,
    };
    try {
      if (schedule) await scheduleService.update(schedule.id, input);
      else await scheduleService.create(input);
      toast.success(schedule ? "Schedule updated" : "Schedule created");
      onSaved();
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.code === "SCHEDULE_CONFLICT") {
        setConflicts(saveError.details as ScheduleConflict[]);
      } else if (!setFromError(saveError)) {
        setError(getErrorMessage(saveError));
      }
    } finally {
      setSaving(false);
    }
  }

  const active = <T extends { isActive: boolean }>(items: T[] | undefined) => (items ?? []).filter((item) => item.isActive);

  return (
    <Modal
      open
      onClose={onClose}
      title={schedule ? "Edit schedule" : "Add schedule"}
      size="lg"
      dismissible={!saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="schedule-form" loading={saving}>
            {schedule ? "Save changes" : "Add schedule"}
          </Button>
        </>
      }
    >
      <form id="schedule-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <Alert tone="danger">{error}</Alert>}
        {conflicts.length > 0 && (
          <div role="alert" className="rounded-lg border border-danger-100 bg-danger-50 p-4 text-sm text-danger-700">
            <p className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="size-4" aria-hidden="true" />
              This schedule conflicts with {conflicts.length} existing class{conflicts.length > 1 ? "es" : ""}:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              {conflicts.map((conflict) => (
                <li key={conflict.schedule.id}>
                  <strong>{conflict.schedule.subject.code}</strong> ({conflict.schedule.section.name}) {DAY_LABELS[conflict.schedule.dayOfWeek]}{" "}
                  {formatTimeRange(conflict.schedule.startTime, conflict.schedule.endTime)}, {classLocation(conflict.schedule)}, {conflict.schedule.instructor.fullName} —
                  same {conflict.reasons.join(" and ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Term"
            required
            value={semesterId}
            onChange={(event) => setValues((current) => ({ ...current, semesterId: event.target.value, sectionId: "" }))}
            options={terms.map((item) => ({ value: String(item.id), label: item.label }))}
            error={errors.semesterId}
          />
          <Select
            label="Section"
            required
            placeholder="Select a section"
            value={values.sectionId}
            onChange={set("sectionId")}
            options={(sections.data ?? []).map((section) => ({ value: String(section.id), label: section.name }))}
            error={errors.sectionId}
          />
          <Select
            label="Subject"
            required
            placeholder="Select a subject"
            value={values.subjectId}
            onChange={set("subjectId")}
            options={active(subjects.data).map((subject) => ({ value: String(subject.id), label: `${subject.code} — ${subject.name}` }))}
            error={errors.subjectId}
            className="sm:col-span-2"
          />
          <Select
            label="Instructor"
            required
            placeholder="Select an instructor"
            value={values.instructorId}
            onChange={set("instructorId")}
            options={active(instructors.data).map((instructor) => ({ value: String(instructor.id), label: `${instructor.lastName}, ${instructor.firstName}` }))}
            error={errors.instructorId}
          />
          <Select label="Mode" required value={values.mode} onChange={set("mode")} options={toOptions(CLASS_MODE_LABELS)} error={errors.mode} />
          {values.mode === "FACE_TO_FACE" ? (
            <Select
              label="Room"
              required
              placeholder="Select a room"
              value={values.roomId}
              onChange={set("roomId")}
              options={active(rooms.data).map((room) => ({ value: String(room.id), label: room.name ? `${room.code} — ${room.name}` : room.code }))}
              error={errors.roomId}
            />
          ) : (
            <p className="self-end pb-2 text-sm text-ink-muted">Online classes don't use a room, so they never clash over rooms.</p>
          )}
          <Select label="Day" required value={values.dayOfWeek} onChange={set("dayOfWeek")} options={toOptions(DAY_LABELS)} error={errors.dayOfWeek} />
          <div className="grid grid-cols-2 gap-3">
            <TextInput label="Start time" type="time" required value={values.startTime} onChange={set("startTime")} error={errors.startTime} />
            <TextInput label="End time" type="time" required value={values.endTime} onChange={set("endTime")} error={errors.endTime} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
