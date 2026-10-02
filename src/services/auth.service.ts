import type { CurrentUser, SessionResponse } from "@/types";
import { api } from "./api";

export const authService = {
  login: (identifier: string, password: string, rememberMe: boolean) =>
    api.post<SessionResponse>("/auth/login", { identifier, password, rememberMe }),

  me: () => api.get<SessionResponse>("/auth/me"),

  /** Never fails for visitors: returns { user: null } when not logged in. */
  session: () => api.get<SessionResponse | { user: null; csrfToken: null }>("/auth/session"),

  logout: () => api.post<null>("/auth/logout"),

  changePassword: (body: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    api.post<{ user: CurrentUser }>("/auth/change-password", body),

  forgotPassword: (identifier: string) => api.post<null>("/auth/forgot-password", { identifier }),

  resetPassword: (body: { token: string; newPassword: string; confirmPassword: string }) =>
    api.post<null>("/auth/reset-password", body),
};
