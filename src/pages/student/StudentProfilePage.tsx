// Personal information. Academic details are read-only; only the contact
// fields an administrator allows can be edited (the backend enforces this too).
import { GraduationCap, House, Pencil, ShieldCheck, UserRound, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { TextInput } from "@/components/form/TextInput";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/ui/Button";
import { DescriptionList } from "@/components/ui/DescriptionList";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { portalService, type MyProfile } from "@/services/portal.service";
import type { StudentProfileField, StudentProfileFields } from "@/types";
import { formatDate, formatYearLevel } from "@/utils/format";
import { PROFILE_FIELD_LABELS } from "@/utils/labels";

export default function StudentProfilePage() {
  useDocumentTitle("My Profile");
  const { data, loading, error, reload, setData } = useApi(() => portalService.profile(), []);
  const [editing, setEditing] = useState(false);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Loading your profile..." />;

  const profile = data.profile;
  const address = [profile.addressLine, profile.barangay, profile.city, profile.province, profile.zipCode].filter(Boolean).join(", ");

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your personal information on file with the school."
        actions={
          data.editableFields.length > 0 && (
            <Button variant="secondary" onClick={() => setEditing(true)} leftIcon={<Pencil className="size-4" aria-hidden="true" />}>
              Update contact details
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Student information" icon={<GraduationCap className="size-5" aria-hidden="true" />} description="Managed by the Registrar's Office." />
          <CardBody>
            <DescriptionList
              items={[
                { label: "Student ID", value: <span className="tabular-nums">{data.studentNumber}</span> },
                { label: "Full name", value: data.fullName },
                { label: "Program", value: data.programName, wide: true },
                { label: "Year level", value: formatYearLevel(data.yearLevel) },
                { label: "Section", value: data.sectionName },
              ]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Personal details" icon={<UserRound className="size-5" aria-hidden="true" />} />
          <CardBody>
            <DescriptionList
              items={[
                { label: "Birthdate", value: formatDate(data.dateOfBirth, "long") },
                { label: "Sex", value: data.sex === "MALE" ? "Male" : "Female" },
                { label: "Personal email", value: profile.email },
                { label: "Contact number", value: profile.contactNumber },
              ]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Address" icon={<House className="size-5" aria-hidden="true" />} />
          <CardBody>
            <DescriptionList items={[{ label: "Home address", value: address, wide: true }]} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Parent / guardian" icon={<Users className="size-5" aria-hidden="true" />} />
          <CardBody>
            <DescriptionList
              items={[
                { label: "Name", value: profile.guardianName },
                { label: "Relationship", value: profile.guardianRelationship },
                { label: "Contact number", value: profile.guardianContactNumber },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      <p className="mt-6 flex items-start gap-2 text-sm text-ink-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary-600" aria-hidden="true" />
        To correct your name, birthdate or academic information, please visit the Registrar's Office.
      </p>

      <EditContactModal
        open={editing}
        profile={data}
        onClose={() => setEditing(false)}
        onSaved={(updated) => {
          setData(updated);
          setEditing(false);
        }}
      />
    </>
  );
}

function EditContactModal({ open, profile, onClose, onSaved }: { open: boolean; profile: MyProfile; onClose: () => void; onSaved: (profile: MyProfile) => void }) {
  const toast = useToast();
  const [values, setValues] = useState<Partial<StudentProfileFields>>({});
  const [saving, setSaving] = useState(false);
  const { errors, setFromError, clear } = useFormErrors();

  // Start from the current values each time the dialog opens.
  const [openedFor, setOpenedFor] = useState<boolean>(false);
  if (open !== openedFor) {
    setOpenedFor(open);
    if (open) {
      setValues(Object.fromEntries(profile.editableFields.map((field) => [field, profile.profile[field] ?? ""])));
      clear();
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      // Send only allowed fields; empty text becomes null.
      const changes = Object.fromEntries(profile.editableFields.map((field) => [field, values[field] || null])) as Partial<StudentProfileFields>;
      const response = await portalService.updateProfile(changes);
      toast.success("Details updated", response.message);
      onSaved(response.data);
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update contact details"
      description="You can change only the fields allowed by the school."
      dismissible={!saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="contact-form" loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <form id="contact-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
        {profile.editableFields.map((field: StudentProfileField) => (
          <TextInput
            key={field}
            label={PROFILE_FIELD_LABELS[field]}
            type={field === "email" ? "email" : field.toLowerCase().includes("contact") ? "tel" : "text"}
            value={values[field] ?? ""}
            onChange={(event) => setValues((current) => ({ ...current, [field]: event.target.value }))}
            error={errors[field]}
            className={field === "addressLine" ? "sm:col-span-2" : undefined}
          />
        ))}
      </form>
    </Modal>
  );
}
