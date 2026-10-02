import { Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { TextInput } from "@/components/form/TextInput";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { AuthLayout } from "@/layouts/AuthLayout";
import { getErrorMessage } from "@/services/api";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  useDocumentTitle("Forgot password");
  const [identifier, setIdentifier] = useState("");
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!identifier.trim()) {
      setError("Enter your student number, username or email.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await authService.forgotPassword(identifier.trim());
      setSentMessage(response.message ?? "If an account matches, a reset link has been sent.");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Forgot your password?" description="We'll email a reset link to the address on your account.">
      {sentMessage ? (
        <div className="space-y-5">
          <Alert tone="success" title="Check your email">
            {sentMessage} The link expires in 30 minutes.
          </Alert>
          <p className="text-sm text-ink-muted">No email on file? Ask the Registrar's Office to issue you a new temporary password.</p>
          <Link to="/login" className="text-sm font-medium text-primary-700 hover:underline">
            ← Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && <Alert tone="danger">{error}</Alert>}
          <TextInput
            label="Student number, username or email"
            autoComplete="username"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            leftIcon={<Mail className="size-4" aria-hidden="true" />}
            required
          />
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Send reset link
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
