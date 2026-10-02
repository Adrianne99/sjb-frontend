import { ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { homePathFor } from "@/contexts/auth-context";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function ForbiddenPage() {
  useDocumentTitle("Access denied");
  const { user } = useAuth();
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <ShieldAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold">Access denied</h1>
      <p className="mt-2 max-w-md text-ink-muted">Your account does not have permission to open this page. If you think this is a mistake, contact the system administrator.</p>
      <ButtonLink to={user ? homePathFor(user) : "/"} className="mt-6">
        Back to my dashboard
      </ButtonLink>
    </div>
  );
}
