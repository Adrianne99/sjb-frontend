// Settings tabs for programs, sections, subjects, instructors and rooms.
// Each one is just configuration for <ReferenceTable>.
import { useState } from "react";
import { Badge } from "@/components/badge/Badge";
import { Select } from "@/components/form/Select";
import { useApi } from "@/hooks/useApi";
import { useAcademicYears, usePrograms } from "@/hooks/useLookups";
import { academicService } from "@/services/academic.service";
import { requirementService, type RequirementTypeInput } from "@/services/requirement.service";
import type { Instructor, Program, RequirementType, Room, Section, Subject } from "@/types";
import { formatYearLevel } from "@/utils/format";
import { allYearLevelOptions } from "@/utils/labels";
import { ReferenceTable, type FormValues } from "./ReferenceTable";

const activeBadge = (isActive: boolean) => <Badge tone={isActive ? "success" : "neutral"}>{isActive ? "Active" : "Inactive"}</Badge>;
const text = (value: FormValues[string]) => (typeof value === "string" ? value.trim() : "");

export function ProgramsPanel() {
  const { data, loading, error, reload } = useApi(() => academicService.programs(), []);
  return (
    <ReferenceTable<Program>
      title="Programs"
      description="Academic programs offered by the school."
      entityLabel="program"
      rows={data}
      loading={loading}
      error={error}
      reload={reload}
      columns={[
        { header: "Code", cell: (row) => <span className="font-medium">{row.code}</span> },
        { header: "Name", primary: true, cell: (row) => row.name },
        { header: "Level", cell: (row) => row.level },
        { header: "Year levels", cell: (row) => row.yearLevels.map(formatYearLevel).join(", ") },
        { header: "Status", cell: (row) => activeBadge(row.isActive) },
      ]}
      fields={[
        { name: "code", label: "Code", required: true, hint: "e.g. IT" },
        { name: "level", label: "Level", required: true, hint: "Use exactly \"Senior High School\" (Grade 11–12) or \"College\"." },
        { name: "name", label: "Program name", required: true, wide: true },
        { name: "durationYears", label: "Duration (years)", type: "number", required: true, hint: "College year levels = 1st up to this number. Senior High is always Grade 11–12." },
        { name: "description", label: "Description", type: "textarea" },
        { name: "isActive", label: "Active (available for new students)", type: "checkbox" },
      ]}
      toForm={(row) => ({ code: row?.code ?? "", name: row?.name ?? "", level: row?.level ?? "College", durationYears: String(row?.durationYears ?? 2), description: row?.description ?? "", isActive: row?.isActive ?? true })}
      toPayload={(values) => ({ code: text(values.code), name: text(values.name), level: text(values.level), durationYears: Number(values.durationYears), description: text(values.description) || null, isActive: values.isActive })}
      create={academicService.createProgram}
      update={academicService.updateProgram}
    />
  );
}

export function SectionsPanel() {
  const years = useAcademicYears();
  const programs = usePrograms();
  const [academicYearId, setAcademicYearId] = useState("");
  const yearId = academicYearId || String(years.data?.[0]?.id ?? "");
  const { data, loading, error, reload } = useApi(() => (yearId ? academicService.sections({ academicYearId: Number(yearId) }) : Promise.resolve([])), [yearId]);
  const programOptions = (programs.data ?? []).map((program) => ({ value: String(program.id), label: program.code }));
  const yearOptions = (years.data ?? []).map((year) => ({ value: String(year.id), label: year.name }));

  return (
    <ReferenceTable<Section>
      title="Sections"
      description="Class sections per academic year, program and year level."
      entityLabel="section"
      rows={data}
      loading={loading}
      error={error}
      reload={reload}
      toolbar={<Select label="Academic year" className="max-w-xs" value={yearId} onChange={(event) => setAcademicYearId(event.target.value)} options={yearOptions} />}
      columns={[
        { header: "Section", primary: true, cell: (row) => <span className="font-medium">{row.name}</span> },
        { header: "Program", cell: (row) => row.programCode },
        { header: "Year level", cell: (row) => formatYearLevel(row.yearLevel) },
        { header: "Academic year", cell: (row) => row.academicYearName },
      ]}
      fields={[
        { name: "name", label: "Section name", required: true, hint: "Unique within the academic year, e.g. IT 1-A" },
        { name: "academicYearId", label: "Academic year", type: "select", options: yearOptions, required: true },
        { name: "programId", label: "Program", type: "select", options: programOptions, required: true },
        { name: "yearLevel", label: "Year level", type: "select", options: allYearLevelOptions(programs.data), required: true, hint: "Senior High: Grade 11–12. IT and HRS: 1st–2nd year." },
      ]}
      toForm={(row) => ({ name: row?.name ?? "", academicYearId: String(row?.academicYearId ?? yearId), programId: String(row?.programId ?? ""), yearLevel: String(row?.yearLevel ?? "") })}
      toPayload={(values) => ({ name: text(values.name), academicYearId: Number(values.academicYearId), programId: Number(values.programId), yearLevel: Number(values.yearLevel) })}
      create={academicService.createSection}
      update={academicService.updateSection}
    />
  );
}

export function SubjectsPanel() {
  const { data, loading, error, reload } = useApi(() => academicService.subjects(), []);
  return (
    <ReferenceTable<Subject>
      title="Subjects"
      entityLabel="subject"
      rows={data}
      loading={loading}
      error={error}
      reload={reload}
      columns={[
        { header: "Code", cell: (row) => <span className="font-medium">{row.code}</span> },
        { header: "Subject", primary: true, cell: (row) => row.name },
        { header: "Units", align: "center", cell: (row) => row.units },
        { header: "Status", cell: (row) => activeBadge(row.isActive) },
      ]}
      fields={[
        { name: "code", label: "Code", required: true },
        { name: "units", label: "Units", type: "number", required: true },
        { name: "name", label: "Subject name", required: true, wide: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "isActive", label: "Active", type: "checkbox" },
      ]}
      toForm={(row) => ({ code: row?.code ?? "", name: row?.name ?? "", units: String(row?.units ?? 3), description: row?.description ?? "", isActive: row?.isActive ?? true })}
      toPayload={(values) => ({ code: text(values.code), name: text(values.name), units: Number(values.units), description: text(values.description) || null, isActive: values.isActive })}
      create={academicService.createSubject}
      update={academicService.updateSubject}
    />
  );
}

export function InstructorsPanel() {
  const { data, loading, error, reload } = useApi(() => academicService.instructors(), []);
  return (
    <ReferenceTable<Instructor>
      title="Instructors"
      entityLabel="instructor"
      rows={data}
      loading={loading}
      error={error}
      reload={reload}
      columns={[
        { header: "Employee no.", cell: (row) => <span className="tabular-nums">{row.employeeNumber}</span> },
        { header: "Name", primary: true, cell: (row) => `${row.lastName}, ${row.firstName}` },
        { header: "Email", cell: (row) => row.email ?? "—" },
        { header: "Status", cell: (row) => activeBadge(row.isActive) },
      ]}
      fields={[
        { name: "employeeNumber", label: "Employee number", required: true },
        { name: "email", label: "Email", type: "text" },
        { name: "firstName", label: "First name", required: true },
        { name: "lastName", label: "Last name", required: true },
        { name: "isActive", label: "Active (can be assigned to classes)", type: "checkbox" },
      ]}
      toForm={(row) => ({ employeeNumber: row?.employeeNumber ?? "", firstName: row?.firstName ?? "", lastName: row?.lastName ?? "", email: row?.email ?? "", isActive: row?.isActive ?? true })}
      toPayload={(values) => ({ employeeNumber: text(values.employeeNumber), firstName: text(values.firstName), lastName: text(values.lastName), email: text(values.email) || null, isActive: values.isActive })}
      create={academicService.createInstructor}
      update={academicService.updateInstructor}
    />
  );
}

export function RoomsPanel() {
  const { data, loading, error, reload } = useApi(() => academicService.rooms(), []);
  return (
    <ReferenceTable<Room>
      title="Rooms"
      entityLabel="room"
      rows={data}
      loading={loading}
      error={error}
      reload={reload}
      columns={[
        { header: "Code", primary: true, cell: (row) => <span className="font-medium">{row.code}</span> },
        { header: "Name", cell: (row) => row.name ?? "—" },
        { header: "Capacity", align: "center", cell: (row) => row.capacity ?? "—" },
        { header: "Status", cell: (row) => activeBadge(row.isActive) },
      ]}
      fields={[
        { name: "code", label: "Room code", required: true },
        { name: "capacity", label: "Capacity", type: "number" },
        { name: "name", label: "Room name", wide: true },
        { name: "isActive", label: "Active (can be scheduled)", type: "checkbox" },
      ]}
      toForm={(row) => ({ code: row?.code ?? "", name: row?.name ?? "", capacity: row?.capacity ? String(row.capacity) : "", isActive: row?.isActive ?? true })}
      toPayload={(values) => ({ code: text(values.code), name: text(values.name) || null, capacity: text(values.capacity) ? Number(values.capacity) : null, isActive: values.isActive })}
      create={academicService.createRoom}
      update={academicService.updateRoom}
    />
  );
}

/** Admission requirements (Form 137, Diploma, Form 138, Good Moral). Shown on the website and in each student's checklist. */
export function RequirementTypesPanel() {
  const { data, loading, error, reload } = useApi(() => requirementService.types(), []);
  return (
    <ReferenceTable<RequirementType>
      title="Admission requirements"
      description="Documents students submit to the Registrar. Active ones appear on the website's Admissions section and in every student's checklist."
      entityLabel="requirement"
      rows={data}
      loading={loading}
      error={error}
      reload={reload}
      columns={[
        { header: "Order", align: "center", cell: (row) => row.sortOrder },
        { header: "Document", primary: true, cell: (row) => <span className="font-medium">{row.name}</span> },
        { header: "Description", cell: (row) => <span className="text-ink-muted">{row.description ?? "—"}</span> },
        { header: "Status", cell: (row) => activeBadge(row.isActive) },
      ]}
      fields={[
        { name: "name", label: "Document name", required: true, wide: true },
        { name: "code", label: "Code", required: true, hint: "Capital letters, e.g. FORM_137" },
        { name: "sortOrder", label: "Order on the list", type: "number" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "isActive", label: "Active (required from students)", type: "checkbox" },
      ]}
      toForm={(row) => ({ name: row?.name ?? "", code: row?.code ?? "", sortOrder: String(row?.sortOrder ?? (data?.length ?? 0) + 1), description: row?.description ?? "", isActive: row?.isActive ?? true })}
      toPayload={(values) => ({ name: text(values.name), code: text(values.code).toUpperCase(), sortOrder: Number(values.sortOrder) || 0, description: text(values.description) || null, isActive: values.isActive })}
      create={(payload) => requirementService.createType(payload as RequirementTypeInput)}
      update={(id, payload) => requirementService.updateType(id, payload as RequirementTypeInput)}
    />
  );
}
