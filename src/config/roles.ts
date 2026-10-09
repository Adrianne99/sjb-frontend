// Role names, labels and descriptions — one place for the whole frontend.
// What each role may DO is decided by the backend (backend/src/config/permissions.ts).
import type { BadgeTone } from "@/components/badge/Badge";
import type { CurrentUser, Role } from "@/types";

/** Roles that use the office (admin) side of the app. */
export const OFFICE_ROLES: Role[] = ["ADMIN", "STAFF", "REGISTRAR", "CASHIER", "TEACHER"];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  STAFF: "Staff",
  REGISTRAR: "Registrar",
  CASHIER: "Cashier",
  TEACHER: "Teacher",
  STUDENT: "Student",
};

export const ROLE_TONES: Record<Role, BadgeTone> = {
  ADMIN: "gold",
  STAFF: "info",
  REGISTRAR: "success",
  CASHIER: "warning",
  TEACHER: "info",
  STUDENT: "neutral",
};

/** Shown when choosing a role for an office account. */
export const ROLE_DESCRIPTIONS: Record<Exclude<Role, "STUDENT">, string> = {
  ADMIN: "Everything, including user accounts, settings and audit logs.",
  STAFF: "All office work: registrar and cashier tasks, grades, schedules and reports.",
  REGISTRAR: "Enrollment: students, online applications, requirements, enrollment and tuition fees.",
  CASHIER: "Payments: find a student, see balances and record payments.",
  TEACHER: "Own classes only: class schedule, class lists, and grades saved as drafts for staff to publish. Must be linked to an instructor.",
};

/** The role options for an office account, e.g. in a <Select>. */
export const OFFICE_ROLE_OPTIONS = OFFICE_ROLES.map((role) => ({ value: role, label: ROLE_LABELS[role] }));

/** "Cashier", or the student number for students. */
export function roleBadgeText(user: Pick<CurrentUser, "role" | "studentNumber">) {
  return user.role === "STUDENT" ? (user.studentNumber ?? ROLE_LABELS.STUDENT) : ROLE_LABELS[user.role];
}
