// Shown right after logging in with a temporary password. The backend blocks
// every other page until the password is changed.
import { useNavigate } from "react-router";
import { ChangePasswordForm } from "@/components/form/ChangePasswordForm";
import { Alert } from "@/components/ui/Alert";
import { homePathFor } from "@/contexts/auth-context";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useToast } from "@/hooks/useToast";
import { AuthLayout } from "@/layouts/AuthLayout";

export default function ChangePasswordPage() {
  useDocumentTitle("Change your password");
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <AuthLayout
      title="Create your new password"
      description={
        <>
          Hello, <strong className="text-ink">{user?.displayName}</strong>. You're using a temporary password. Please replace it before continuing.
        </>
      }
    >
      <Alert tone="info" className="mb-6">
        {user?.role === "STUDENT"
          ? "Your temporary password is your birthdate (MMDDYYYY) or the one the Registrar gave you. Enter it below as your current password."
          : "Enter the temporary password you were given as your current password."}
      </Alert>
      <ChangePasswordForm
        submitLabel="Save new password"
        onChanged={(updated) => {
          toast.success("Password changed", "You can now use your new password to log in.");
          navigate(homePathFor(updated), { replace: true });
        }}
      />
      <button
        type="button"
        onClick={async () => {
          await logout();
          navigate("/login", { replace: true });
        }}
        className="mt-6 w-full text-center text-sm text-ink-muted hover:text-primary-700 hover:underline"
      >
        Log out instead
      </button>
    </AuthLayout>
  );
}
