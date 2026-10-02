// Only lets logged-in users through. (UX only — the backend enforces access.)
// Users with a temporary password are sent to /change-password first.
import { Navigate, Outlet, useLocation } from "react-router";
import { LoadingState } from "@/components/ui/States";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <LoadingState label="Checking your session..." className="min-h-dvh" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  return <Outlet />;
}
