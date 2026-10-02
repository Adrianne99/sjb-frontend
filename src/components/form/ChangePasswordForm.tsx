// Current / new / confirm password form. Used on the forced first-login page
// and in Settings.
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useFormErrors } from "@/hooks/useFormErrors";
import { getErrorMessage } from "@/services/api";
import { authService } from "@/services/auth.service";
import type { CurrentUser } from "@/types";
import { PasswordChecklist } from "./PasswordChecklist";
import { PasswordInput } from "./PasswordInput";

export function ChangePasswordForm({ onChanged, submitLabel = "Change password" }: { onChanged: (user: CurrentUser) => void; submitLabel?: string }) {
  const { setUser } = useAuth();
  const [values, setValues] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { errors, setFromError, clear } = useFormErrors();

  const update = (field: keyof typeof values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    clear();
    setError(null);
    setSubmitting(true);
    try {
      const response = await authService.changePassword(values);
      // The response includes the updated user (mustChangePassword is now false).
      setUser(response.data.user);
      setValues({ currentPassword: "", newPassword: "", confirmPassword: "" });
      onChanged(response.data.user);
    } catch (changeError) {
      if (!setFromError(changeError)) setError(getErrorMessage(changeError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && <Alert tone="danger">{error}</Alert>}
      <PasswordInput label="Current password" autoComplete="current-password" value={values.currentPassword} onChange={update("currentPassword")} error={errors.currentPassword} required />
      <div>
        <PasswordInput label="New password" autoComplete="new-password" value={values.newPassword} onChange={update("newPassword")} error={errors.newPassword} required />
        <PasswordChecklist password={values.newPassword} />
      </div>
      <PasswordInput label="Confirm new password" autoComplete="new-password" value={values.confirmPassword} onChange={update("confirmPassword")} error={errors.confirmPassword} required />
      <Button type="submit" size="lg" fullWidth loading={submitting}>
        {submitLabel}
      </Button>
    </form>
  );
}
