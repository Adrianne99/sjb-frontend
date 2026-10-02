import { Bell, KeyRound, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { ChangePasswordForm } from "@/components/form/ChangePasswordForm";
import { Checkbox } from "@/components/form/Checkbox";
import { Button } from "@/components/ui/Button";
import { DescriptionList } from "@/components/ui/DescriptionList";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { portalService, type NotificationPreferences } from "@/services/portal.service";

export default function StudentSettingsPage() {
  useDocumentTitle("Settings");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const preferences = useApi(() => portalService.preferences(), []);
  const [savingPreferences, setSavingPreferences] = useState(false);

  async function togglePreference(field: keyof NotificationPreferences, value: boolean) {
    if (!preferences.data) return;
    setSavingPreferences(true);
    try {
      const response = await portalService.updatePreferences({ ...preferences.data, [field]: value });
      preferences.setData(response.data);
      toast.success("Preferences saved");
    } catch (error) {
      toast.error("Could not save preferences", getErrorMessage(error));
    } finally {
      setSavingPreferences(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Manage your password, account and notifications." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title="Change password" icon={<KeyRound className="size-5" aria-hidden="true" />} description="Use a password you don't use anywhere else." />
          <CardBody>
            <ChangePasswordForm onChanged={() => toast.success("Password changed", "Other devices have been signed out.")} />
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Account information" icon={<UserRound className="size-5" aria-hidden="true" />} />
            <CardBody>
              <DescriptionList
                items={[
                  { label: "Username", value: user?.username },
                  { label: "Account email", value: user?.email },
                  { label: "Name", value: user?.displayName, wide: true },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Email notifications" icon={<Bell className="size-5" aria-hidden="true" />} />
            <CardBody className="space-y-4">
              {preferences.loading || !preferences.data ? (
                <LoadingState label="Loading preferences..." className="py-4" />
              ) : (
                <>
                  <Checkbox
                    label="School announcements"
                    description="Allow the school to email you about new announcements."
                    checked={preferences.data.notifyAnnouncements}
                    disabled={savingPreferences}
                    onChange={(event) => void togglePreference("notifyAnnouncements", event.target.checked)}
                  />
                  <Checkbox
                    label="Enrollment, payments and grades"
                    description="Get an email when you are enrolled, when a payment is recorded, and when new grades are released (grades themselves are only shown in the portal)."
                    checked={preferences.data.notifySchoolRecords}
                    disabled={savingPreferences}
                    onChange={(event) => void togglePreference("notifySchoolRecords", event.target.checked)}
                  />
                  <Checkbox
                    label="Account activity"
                    description="Get an email when your password is changed."
                    checked={preferences.data.notifyAccountActivity}
                    disabled={savingPreferences}
                    onChange={(event) => void togglePreference("notifyAccountActivity", event.target.checked)}
                  />
                </>
              )}
            </CardBody>
          </Card>

          <Button
            variant="secondary"
            fullWidth
            leftIcon={<LogOut className="size-4" aria-hidden="true" />}
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </>
  );
}
