// Admin-only services: users, audit logs, settings, plus reports and announcements.
import type {
  Announcement,
  AuditLog,
  CollectionsReport,
  DashboardData,
  EnrollmentSummaryReport,
  GradingConfig,
  IssuedCredentials,
  OutstandingBalanceRow,
  QueryParams,
  Role,
  StudentProfileField,
  UserAccount,
} from "@/types";
import { api } from "./api";

export const userService = {
  list: (query: QueryParams) => api.list<UserAccount>("/users", query),
  /** `instructorId` is required for a TEACHER account. */
  create: (body: { username: string; email: string; firstName: string; lastName: string; position: string | null; role: Role; instructorId?: number }) =>
    api.post<{ user: UserAccount; credentials: IssuedCredentials }>("/users", body),
  update: (id: number, body: Partial<{ email: string | null; firstName: string; lastName: string; position: string | null; role: Role; instructorId: number; isActive: boolean }>) =>
    api.put<UserAccount>(`/users/${id}`, body),
  resetPassword: (id: number) => api.post<IssuedCredentials>(`/users/${id}/reset-password`),
};

export const auditService = {
  list: (query: QueryParams) => api.list<AuditLog>("/audit-logs", query),
};

export const settingsService = {
  get: () => api.get<{ grading: GradingConfig; gradingByLevel: Record<string, GradingConfig>; studentEditableFields: StudentProfileField[] }>("/settings"),
  /** Without a level: the default scale. With a level (e.g. "Senior High School"): that level's scale. */
  updateGrading: (config: GradingConfig, level?: string) =>
    api.put<GradingConfig>(level ? `/settings/grading?level=${encodeURIComponent(level)}` : "/settings/grading", config),
  removeGradingLevel: (level: string) => api.delete<null>(`/settings/grading?level=${encodeURIComponent(level)}`),
  updateStudentEditableFields: (fields: StudentProfileField[]) =>
    api.put<StudentProfileField[]>("/settings/student-editable-fields", { fields }),
};

export const reportService = {
  dashboard: () => api.get<DashboardData>("/reports/dashboard"),
  enrollmentSummary: (semesterId?: number) => api.get<EnrollmentSummaryReport>("/reports/enrollment-summary", { semesterId }),
  collections: (dateFrom: string, dateTo: string) => api.get<CollectionsReport>("/reports/collections", { dateFrom, dateTo }),
  outstanding: (query: QueryParams) => api.list<OutstandingBalanceRow>("/reports/outstanding-balances", query),
};

export interface AnnouncementInput {
  title: string;
  content: string;
  audience: Announcement["audience"];
  category: Announcement["category"];
  status: NonNullable<Announcement["status"]>;
  publishDate: string;
  expirationDate: string | null;
}

export const announcementService = {
  listPublic: () => api.get<Announcement[]>("/announcements/public"),
  /** One public announcement, for its own page ("Read more"). */
  getPublic: (id: number) => api.get<Announcement>(`/announcements/public/${id}`),
  uploadImage: (id: number, photo: Blob) => api.upload<Announcement>(`/announcements/${id}/image`, photo),
  removeImage: (id: number) => api.delete<Announcement>(`/announcements/${id}/image`),
  list: (query: QueryParams) => api.list<Announcement>("/announcements", query),
  create: (input: AnnouncementInput) => api.post<Announcement>("/announcements", input),
  update: (id: number, input: AnnouncementInput) => api.put<Announcement>(`/announcements/${id}`, input),
};
