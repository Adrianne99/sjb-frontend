import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { PasswordChecklist } from "@/components/form/PasswordChecklist";
import { PasswordInput } from "@/components/form/PasswordInput";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormErrors } from "@/hooks/useFormErrors";
import { AuthLayout } from "@/layouts/AuthLayout";
import { getErrorMessage } from "@/services/api";
import { authService } from "@/services/auth.service";

export default function ResetPasswordPage() {
  useDocumentTitle("Reset password");
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { errors, setFromError, clear } = useFormErrors();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    clear();
    setError(null);
    setSubmitting(true);
    try {
      await authService.resetPassword({ token, newPassword, confirmPassword });
      setDone(true);
    } catch (resetError) {
      if (!setFromError(resetError)) setError(getErrorMessage(resetError));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout title="Reset password">
        <Alert tone="danger">This reset link is incomplete. Please use the link from your email, or request a new one.</Alert>
        <ButtonLink to="/forgot-password" variant="secondary" className="mt-5">
          Request a new link
        </ButtonLink>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password">
      {done ? (
        <div className="space-y-5">
          <Alert tone="success" title="Password updated">
            Your password has been reset. For your security, you were signed out on all devices.
          </Alert>
          <ButtonLink to="/login" fullWidth size="lg">
            Go to login
          </ButtonLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && <Alert tone="danger">{error}</Alert>}
          <div>
            <PasswordInput label="New password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} error={errors.newPassword} required />
            <PasswordChecklist password={newPassword} />
          </div>
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={errors.confirmPassword}
            required
          />
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Reset password
          </Button>
          <p className="text-center text-sm">
            <Link to="/login" className="font-medium text-primary-700 hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
