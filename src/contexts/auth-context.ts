import { createContext } from "react";
import type { CurrentUser, Permission } from "@/types";

export interface AuthContextValue {
  user: CurrentUser | null;
  /** True until we know whether the visitor is logged in. */
  checking: boolean;
  /** Set when the server rejected the session (e.g. it expired). */
  sessionExpired: boolean;
  login: (identifier: string, password: string, rememberMe: boolean) => Promise<CurrentUser>;
  logout: () => Promise<void>;
  /** Replace the stored user (e.g. after changing the password). */
  setUser: (user: CurrentUser) => void;
  /** UX only — the backend always re-checks permissions. */
  can: (permission: Permission) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Where each role lands after logging in. */
export function homePathFor(user: CurrentUser): string {
  if (user.mustChangePassword) return "/change-password";
  return user.role === "STUDENT" ? "/student" : "/admin";
}
