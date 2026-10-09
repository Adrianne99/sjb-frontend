// My Account (office staff and teachers): own details and email settings.
// Password changes use authService.changePassword (POST /api/auth/change-password).
import type { Role } from "@/types";
import { api } from "./api";

export interface MyAccount {
  username: string;
  role: Role;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  contactNumber: string | null;
  /** TEACHER accounts: the linked instructor. */
  instructor: { id: number; employeeNumber: string; fullName: string } | null;
  notifications: { notifyAccountActivity: boolean; notifyWorkUpdates: boolean };
}

export const accountService = {
  get: () => api.get<MyAccount>("/account"),
  updateProfile: (body: { firstName: string; lastName: string; email: string; contactNumber: string | null }) => api.put<MyAccount>("/account/profile", body),
  updateNotifications: (body: MyAccount["notifications"]) => api.put<MyAccount>("/account/notifications", body),
};
