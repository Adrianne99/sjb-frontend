// Keeps track of who is logged in.
//
// The session itself lives in an HTTP-only cookie that JavaScript cannot read.
// On page load we ask the backend "who am I?" (GET /api/auth/session). Nothing
// sensitive is stored in localStorage.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { setCsrfToken, setUnauthorizedHandler } from "@/services/api";
import { authService } from "@/services/auth.service";
import type { CurrentUser, Permission } from "@/types";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<CurrentUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Restore the session on first load.
  useEffect(() => {
    let cancelled = false;
    authService
      .session()
      .then((session) => {
        if (cancelled) return;
        setCsrfToken(session.csrfToken);
        setUserState(session.user);
      })
      .catch(() => {
        if (!cancelled) setUserState(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // If any request comes back 401, the session has ended.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setCsrfToken(null);
      setUserState(null);
      setSessionExpired(true);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (identifier: string, password: string, rememberMe: boolean) => {
    const response = await authService.login(identifier, password, rememberMe);
    setCsrfToken(response.data.csrfToken);
    setUserState(response.data.user);
    setSessionExpired(false);
    return response.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setCsrfToken(null);
      setUserState(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      checking,
      sessionExpired,
      login,
      logout,
      setUser: setUserState,
      can: (permission: Permission) => Boolean(user?.permissions.includes(permission)),
    }),
    [user, checking, sessionExpired, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
