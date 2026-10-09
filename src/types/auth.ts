/** ADMIN = superadministrator · STAFF = all-around office staff · REGISTRAR = enrollment · CASHIER = payments · TEACHER = own classes */
export type Role = "ADMIN" | "STAFF" | "REGISTRAR" | "CASHIER" | "TEACHER" | "STUDENT";

/** Permission names — must match backend/src/config/permissions.ts. */
export type Permission =
  | "dashboard:read"
  | "students:read"
  | "students:write"
  | "students:archive"
  | "student-accounts:manage"
  | "applications:read"
  | "applications:write"
  | "requirements:read"
  | "requirements:write"
  | "enrollments:read"
  | "enrollments:write"
  | "assessments:write"
  | "grades:read"
  | "grades:write"
  | "grades:publish"
  | "grades:edit-published"
  | "schedules:read"
  | "schedules:write"
  | "payments:read"
  | "payments:record"
  | "payments:void"
  | "payments:edit"
  | "reports:read"
  | "announcements:manage"
  | "academic:read"
  | "academic:manage"
  | "users:manage"
  | "audit:read"
  | "settings:manage"
  | "account:self"
  | "teaching:own"
  | "portal:self";

export interface CurrentUser {
  id: number;
  username: string;
  email: string | null;
  role: Role;
  mustChangePassword: boolean;
  displayName: string;
  studentId: number | null;
  studentNumber: string | null;
  permissions: Permission[];
}

export interface SessionResponse {
  user: CurrentUser;
  csrfToken: string;
}

/** Returned ONCE when an account is created or a password is reset. */
export interface IssuedCredentials {
  username: string;
  temporaryPassword: string;
  emailSent?: boolean;
}

export interface UserAccount {
  id: number;
  username: string;
  email: string | null;
  role: Role;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  studentId: number | null;
  studentNumber: string | null;
  /** TEACHER accounts: the linked instructor. */
  instructorId: number | null;
  instructorName: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  isLocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
