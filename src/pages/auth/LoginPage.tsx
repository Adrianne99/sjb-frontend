import { LogIn, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import { Checkbox } from "@/components/form/Checkbox";
import { PasswordInput } from "@/components/form/PasswordInput";
import { TextInput } from "@/components/form/TextInput";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { homePathFor } from "@/contexts/auth-context";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { AuthLayout } from "@/layouts/AuthLayout";
import { getErrorMessage } from "@/services/api";

export default function LoginPage() {
  useDocumentTitle("Login");
  const { user, login, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user && !submitting) return <Navigate to={homePathFor(user)} replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError("Enter your student number or username and your password.");
      return;
    }
    setSubmitting(true);
    try {
      const loggedIn = await login(identifier.trim(), password, rememberMe);
      // Go back to the page they wanted, if it belongs to their portal.
      const portalPrefix = loggedIn.role === "STUDENT" ? "/student" : "/admin";
      const target = !loggedIn.mustChangePassword && from?.startsWith(portalPrefix) ? from : homePathFor(loggedIn);
      navigate(target, { replace: true });
    } catch (loginError) {
      setError(getErrorMessage(loginError));
      setPassword("");
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Log in to your portal" description="Students, staff and administrators use the same login page.">
      {sessionExpired && !error && (
        <Alert tone="info" className="mb-5">
          Your session has ended. Please log in again.
        </Alert>
      )}
      {error && (
        <Alert tone="danger" className="mb-5">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <TextInput
          label="Student number or username"
          name="identifier"
          autoComplete="username"
          placeholder="e.g. 2026-0001"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          leftIcon={<UserRound className="size-4" aria-hidden="true" />}
          required
        />
        <PasswordInput label="Password" name="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />

        <div className="flex items-center justify-between gap-3">
          <Checkbox label="Remember me" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
          <Link to="/forgot-password" className="text-sm font-medium text-primary-700 hover:text-primary-900 hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={submitting} leftIcon={<LogIn className="size-4" aria-hidden="true" />}>
          Log in
        </Button>
      </form>

      <p className="mt-8 rounded-lg bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-muted">
        <strong className="text-ink-soft">First time logging in?</strong> Use your student number and the temporary password given by the Registrar's Office. You will be asked to create a new password.
      </p>
    </AuthLayout>
  );
}
