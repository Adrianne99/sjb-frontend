// Create or edit a student record (same form). On create you can also enroll
// the student and create their portal account in one step — the backend does
// it all in a single transaction.
import { Save } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { CredentialsModal } from "@/components/admin/CredentialsModal";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { Checkbox } from "@/components/form/Checkbox";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormErrors } from "@/hooks/useFormErrors";
import { usePrograms, useSections, useTerms } from "@/hooks/useLookups";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { studentService } from "@/services/student.service";
import type { IssuedCredentials, StudentDetail, StudentFormValues, StudentProfileFields } from "@/types";
import { yearLevelOptions } from "@/utils/labels";

const EMPTY_PROFILE: StudentProfileFields = {
  email: null,
  contactNumber: null,
  addressLine: null,
  barangay: null,
  city: null,
  province: null,
  zipCode: null,
  guardianName: null,
  guardianRelationship: null,
  guardianContactNumber: null,
};

function toFormValues(student?: StudentDetail): StudentFormValues {
  return {
    studentNumber: student?.studentNumber ?? "",
    firstName: student?.firstName ?? "",
    middleName: student?.middleName ?? "",
    lastName: student?.lastName ?? "",
    suffix: student?.suffix ?? "",
    dateOfBirth: student?.dateOfBirth ?? "",
    sex: student?.sex ?? "",
    programId: student?.programId ?? "",
    status: student?.status === "GRADUATED" ? "GRADUATED" : "ACTIVE",
    profile: student?.profile ?? EMPTY_PROFILE,
  };
}

export default function StudentFormPage() {
  const { id } = useParams();
  const studentId = id ? Number(id) : null;
  const existing = useApi(() => (studentId ? studentService.get(studentId) : Promise.resolve(undefined)), [studentId]);

  if (studentId && existing.error) return <ErrorState message={existing.error} onRetry={existing.reload} />;
  if (studentId && (existing.loading || !existing.data)) return <LoadingState label="Loading student record..." />;
  return <StudentForm key={studentId ?? "new"} student={existing.data} />;
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      </CardBody>
    </Card>
  );
}

function StudentForm({ student }: { student?: StudentDetail }) {
  const isEdit = Boolean(student);
  useDocumentTitle(isEdit ? "Edit student" : "New student");
  const navigate = useNavigate();
  const toast = useToast();
  const programs = usePrograms();
  const { terms, currentTerm } = useTerms();

  const [values, setValues] = useState<StudentFormValues>(() => toFormValues(student));
  const [enrollNow, setEnrollNow] = useState(true);
  const [enrollment, setEnrollment] = useState({ semesterId: "", yearLevel: "1", sectionId: "", status: "PENDING" as "PENDING" | "ENROLLED" });
  const [createAccount, setCreateAccount] = useState(true);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<{ value: IssuedCredentials; studentId: number } | null>(null);
  const { errors, setFromError } = useFormErrors();
  const [formError, setFormError] = useState<string | null>(null);

  // Only the chosen program's year levels (Grade 11–12 for Senior High, 1st–2nd year for IT/HRS).
  const selectedProgram = (programs.data ?? []).find((program) => String(program.id) === String(values.programId));
  const levelOptions = yearLevelOptions(selectedProgram?.yearLevels ?? []);
  const yearLevel = levelOptions.some((option) => option.value === enrollment.yearLevel) ? enrollment.yearLevel : (levelOptions[0]?.value ?? "");

  const semesterId = enrollment.semesterId || String(currentTerm?.id ?? "");
  const term = terms.find((item) => String(item.id) === semesterId);
  const sections = useSections(term?.academicYearId);
  const sectionOptions = (sections.data ?? [])
    .filter((section) => String(section.programId) === String(values.programId) && String(section.yearLevel) === yearLevel)
    .map((section) => ({ value: String(section.id), label: section.name }));

  const setField = (field: keyof StudentFormValues) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const setProfile = (field: keyof StudentProfileFields) => (event: { target: { value: string } }) =>
    setValues((current) => ({ ...current, profile: { ...current.profile, [field]: event.target.value } }));
  const profileError = (field: keyof StudentProfileFields) => errors[`profile.${field}`];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);

    // Empty text boxes are sent as null.
    const clean = (value: string | null | undefined) => (value && value.trim() ? value.trim() : null);
    const payload: StudentFormValues = {
      ...values,
      middleName: clean(values.middleName),
      suffix: clean(values.suffix),
      programId: Number(values.programId) || "",
      profile: Object.fromEntries(Object.entries(values.profile).map(([key, value]) => [key, clean(value)])) as unknown as StudentProfileFields,
    };

    try {
      if (student) {
        await studentService.update(student.id, { ...payload, studentNumber: undefined });
        toast.success("Student record updated");
        navigate(`/admin/students/${student.id}`);
      } else {
        const response = await studentService.create({
          ...payload,
          studentNumber: clean(values.studentNumber) ?? undefined,
          status: undefined,
          initialEnrollment: enrollNow
            ? { semesterId: Number(semesterId), yearLevel: Number(yearLevel), sectionId: enrollment.sectionId ? Number(enrollment.sectionId) : null, status: enrollment.status }
            : null,
          createAccount,
        });
        toast.success("Student record created", `${response.data.student.fullName} · ${response.data.student.studentNumber}`);
        if (response.data.credentials) setCredentials({ value: response.data.credentials, studentId: response.data.student.id });
        else navigate(`/admin/students/${response.data.student.id}`);
      }
    } catch (error) {
      setFromError(error);
      setFormError(getErrorMessage(error));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title={isEdit ? `Edit ${student!.fullName}` : "New student"}
        description={isEdit ? `Student ID ${student!.studentNumber}` : "Information is entered once and reused across enrollment, grades and payments."}
        breadcrumbs={[{ label: "Students", to: "/admin/students" }, ...(isEdit ? [{ label: student!.fullName, to: `/admin/students/${student!.id}` }] : []), { label: isEdit ? "Edit" : "New" }]}
      />

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {formError && <Alert tone="danger">{formError}</Alert>}

        <Section title="Student identity">
          {!isEdit && (
            <TextInput label="Student ID" placeholder="e.g. 2026-0042" value={values.studentNumber ?? ""} onChange={setField("studentNumber")} hint="Leave blank to generate the next number." error={errors.studentNumber} />
          )}
          <TextInput label="First name" required value={values.firstName} onChange={setField("firstName")} error={errors.firstName} autoComplete="off" />
          <TextInput label="Middle name" value={values.middleName ?? ""} onChange={setField("middleName")} error={errors.middleName} autoComplete="off" />
          <TextInput label="Last name" required value={values.lastName} onChange={setField("lastName")} error={errors.lastName} autoComplete="off" />
          <TextInput label="Suffix" placeholder="Jr., III" value={values.suffix ?? ""} onChange={setField("suffix")} error={errors.suffix} />
          <TextInput
            label="Date of birth"
            type="date"
            required
            value={values.dateOfBirth}
            onChange={setField("dateOfBirth")}
            error={errors.dateOfBirth}
            hint={!isEdit ? "Also used for the temporary password (MMDDYYYY)." : undefined}
          />
          <Select
            label="Sex"
            required
            placeholder="Select"
            value={values.sex}
            onChange={setField("sex")}
            options={[
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
            ]}
            error={errors.sex}
          />
        </Section>

        <Section title="Program">
          <Select
            label="Program"
            required
            placeholder="Select a program"
            value={String(values.programId)}
            onChange={setField("programId")}
            options={(programs.data ?? []).filter((program) => program.isActive || program.id === values.programId).map((program) => ({ value: String(program.id), label: `${program.code} — ${program.name}` }))}
            error={errors.programId}
            className="sm:col-span-2"
          />
          {isEdit && (
            <Select
              label="Record status"
              value={values.status ?? "ACTIVE"}
              onChange={setField("status")}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "GRADUATED", label: "Graduated" },
              ]}
            />
          )}
        </Section>

        <Section title="Contact & address">
          <TextInput label="Personal email" type="email" value={values.profile.email ?? ""} onChange={setProfile("email")} error={profileError("email")} />
          <TextInput label="Contact number" type="tel" placeholder="09XX XXX XXXX" value={values.profile.contactNumber ?? ""} onChange={setProfile("contactNumber")} error={profileError("contactNumber")} />
          <TextInput label="Street address" value={values.profile.addressLine ?? ""} onChange={setProfile("addressLine")} error={profileError("addressLine")} />
          <TextInput label="Barangay" value={values.profile.barangay ?? ""} onChange={setProfile("barangay")} error={profileError("barangay")} />
          <TextInput label="City / Municipality" value={values.profile.city ?? ""} onChange={setProfile("city")} error={profileError("city")} />
          <TextInput label="Province" value={values.profile.province ?? ""} onChange={setProfile("province")} error={profileError("province")} />
          <TextInput label="ZIP code" inputMode="numeric" value={values.profile.zipCode ?? ""} onChange={setProfile("zipCode")} error={profileError("zipCode")} />
        </Section>

        <Section title="Parent / guardian">
          <TextInput label="Guardian name" value={values.profile.guardianName ?? ""} onChange={setProfile("guardianName")} error={profileError("guardianName")} />
          <TextInput label="Relationship" placeholder="Mother, Father, Guardian" value={values.profile.guardianRelationship ?? ""} onChange={setProfile("guardianRelationship")} error={profileError("guardianRelationship")} />
          <TextInput label="Guardian contact number" type="tel" value={values.profile.guardianContactNumber ?? ""} onChange={setProfile("guardianContactNumber")} error={profileError("guardianContactNumber")} />
        </Section>

        {!isEdit && (
          <Card>
            <CardHeader title="Enrollment & portal account" description="Optional — you can also do these later from the student record." />
            <CardBody className="space-y-5">
              <Checkbox label="Enroll this student in a term now" checked={enrollNow} onChange={(event) => setEnrollNow(event.target.checked)} />
              {enrollNow && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Select
                    label="Term"
                    value={semesterId}
                    onChange={(event) => setEnrollment({ ...enrollment, semesterId: event.target.value, sectionId: "" })}
                    options={terms.map((item) => ({ value: String(item.id), label: item.label }))}
                    error={errors.semesterId}
                  />
                  <Select label="Year level" value={yearLevel} onChange={(event) => setEnrollment({ ...enrollment, yearLevel: event.target.value, sectionId: "" })} options={levelOptions} placeholder={levelOptions.length ? undefined : "Choose a program first"} />
                  <Select
                    label="Section"
                    placeholder={values.programId ? "No section yet" : "Choose a program first"}
                    value={enrollment.sectionId}
                    onChange={(event) => setEnrollment({ ...enrollment, sectionId: event.target.value })}
                    options={sectionOptions}
                    error={errors.sectionId}
                  />
                  <Select
                    label="Enrollment status"
                    value={enrollment.status}
                    onChange={(event) => setEnrollment({ ...enrollment, status: event.target.value as "PENDING" | "ENROLLED" })}
                    options={[
                      { value: "PENDING", label: "Pending" },
                      { value: "ENROLLED", label: "Enrolled" },
                    ]}
                  />
                </div>
              )}
              <Checkbox
                label="Create a Student Portal account"
                description="Username = student ID. Temporary password = birthdate (MMDDYYYY). The student must change it at first login."
                checked={createAccount}
                onChange={(event) => setCreateAccount(event.target.checked)}
              />
            </CardBody>
          </Card>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} leftIcon={<Save className="size-4" aria-hidden="true" />}>
            {isEdit ? "Save changes" : "Create student"}
          </Button>
        </div>
      </form>

      <CredentialsModal
        title="Portal account created"
        credentials={credentials?.value ?? null}
        onClose={() => {
          const target = credentials?.studentId;
          setCredentials(null);
          if (target) navigate(`/admin/students/${target}`);
        }}
      />
    </>
  );
}
