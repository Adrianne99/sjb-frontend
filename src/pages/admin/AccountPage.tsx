// My Account — for office staff and teachers: own details, password and email
// settings. (Students have their own Settings page in the Student Portal.)
// Position, role and the linked instructor are set by an administrator.
import { Bell, KeyRound, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { ChangePasswordForm } from "@/components/form/ChangePasswordForm";
import { Checkbox } from "@/components/form/Checkbox";
import { TextInput } from "@/components/form/TextInput";
import { Button } from "@/components/ui/Button";
import { DescriptionList } from "@/components/ui/DescriptionList";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { ROLE_LABELS } from "@/config/roles";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useToast } from "@/hooks/useToast";
import { accountService, type MyAccount } from "@/services/account.service";
import { getErrorMessage } from "@/services/api";
import { authService } from "@/services/auth.service";

export default function AccountPage() {
  useDocumentTitle("My Account");
  const toast = useToast();
  const account = useApi(() => accountService.get(), []);

  if (account.error) return <ErrorState message={account.error} onRetry={account.reload} />;
  if (account.loading || !account.data) return <LoadingState label="Loading your account..." />;

  return (
    <>
      <PageHeader title="My Account" description="Your details, password and email settings." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ProfileCard account={account.data} onSaved={account.setData} />
          <NotificationsCard account={account.data} onSaved={account.setData} />
        </div>
        <Card>
          <CardHeader title="Change password" icon={<KeyRound className="size-5" aria-hidden="true" />} description="Use a password you don't use anywhere else." />
          <CardBody>
            <ChangePasswordForm onChanged={() => toast.success("Password changed", "Other devices have been signed out.")} />
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function ProfileCard({ account, onSaved }: { account: MyAccount; onSaved: (account: MyAccount) => void }) {
  const toast = useToast();
  const { setUser } = useAuth();
  const { errors, setFromError, clear } = useFormErrors();
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    firstName: account.firstName ?? "",
    lastName: account.lastName ?? "",
    email: account.email ?? "",
    contactNumber: account.contactNumber ?? "",
  });
  const set = (field: keyof typeof values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    clear();
    try {
      const response = await accountService.updateProfile({ ...values, contactNumber: values.contactNumber.trim() || null });
      onSaved(response.data);
      // Refresh the name shown in the header and sidebar.
      setUser((await authService.me()).user);
      toast.success("Details saved");
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save your details", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Your details" icon={<UserRound className="size-5" aria-hidden="true" />} />
      <CardBody className="space-y-5">
        <DescriptionList
          items={[
            { label: "Username", value: account.username },
            { label: "Role", value: ROLE_LABELS[account.role] },
            { label: "Position", value: account.position },
            ...(account.instructor ? [{ label: "Instructor record", value: `${account.instructor.fullName} (${account.instructor.employeeNumber})` }] : []),
          ]}
        />
        <form onSubmit={handleSubmit} className="space-y-4 border-t border-border pt-5" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInput label="First name" required value={values.firstName} onChange={set("firstName")} error={errors.firstName} />
            <TextInput label="Last name" required value={values.lastName} onChange={set("lastName")} error={errors.lastName} />
            <TextInput label="Email" type="email" required value={values.email} onChange={set("email")} error={errors.email} hint="Password reset links are sent here." />
            <TextInput label="Contact number" type="tel" inputMode="tel" value={values.contactNumber} onChange={set("contactNumber")} placeholder="0917 123 4567" error={errors.contactNumber} />
          </div>
          <p className="text-xs text-ink-muted">Your username, role and position are managed by the administrator.</p>
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Save details
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function NotificationsCard({ account, onSaved }: { account: MyAccount; onSaved: (account: MyAccount) => void }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  async function toggle(field: keyof MyAccount["notifications"], value: boolean) {
    setSaving(true);
    try {
      const response = await accountService.updateNotifications({ ...account.notifications, [field]: value });
      onSaved(response.data);
      toast.success("Email settings saved");
    } catch (error) {
      toast.error("Could not save email settings", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Email settings" icon={<Bell className="size-5" aria-hidden="true" />} description={account.email ? `Sent to ${account.email}` : "Add an email address to receive emails."} />
      <CardBody className="space-y-4">
        <Checkbox
          label="Account security"
          description="When your password is changed."
          checked={account.notifications.notifyAccountActivity}
          disabled={saving}
          onChange={(event) => void toggle("notifyAccountActivity", event.target.checked)}
        />
        {account.role === "TEACHER" && (
          <Checkbox
            label="Grade review updates"
            description="When the Registrar's Office returns or publishes the grades you submitted."
            checked={account.notifications.notifyWorkUpdates}
            disabled={saving}
            onChange={(event) => void toggle("notifyWorkUpdates", event.target.checked)}
          />
        )}
      </CardBody>
    </Card>
  );
}
