// Only lets certain roles (or permissions) through, otherwise shows "Access denied".
// This is for a good user experience; the real security check is on the backend.
import { Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import ForbiddenPage from "@/pages/ForbiddenPage";
import type { Permission, Role } from "@/types";

interface RoleRouteProps {
  roles?: Role[];
  permission?: Permission;
}

export function RoleRoute({ roles, permission }: RoleRouteProps) {
  const { user, can } = useAuth();
  if (!user) return null;
  const roleOk = !roles || roles.includes(user.role);
  const permissionOk = !permission || can(permission);
  return roleOk && permissionOk ? <Outlet /> : <ForbiddenPage />;
}
