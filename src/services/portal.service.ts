// Student portal (/api/me/*). The backend always uses the logged-in student —
// there is no way to ask for another student's data from here.
import type {
  AcademicHistory,
  Announcement,
  ReportCard,
  Schedule,
  StudentDetail,
  StudentOverview,
  StudentPayment,
  StudentProfileField,
  StudentProfileFields,
  StudentStatement,
} from "@/types";
import { api } from "./api";

export type MyProfile = Omit<StudentDetail, "account" | "currentEnrollment" | "enrollments" | "balance"> & {
  programName: string;
  yearLevel: number | null;
  sectionName: string | null;
  editableFields: StudentProfileField[];
};

/** Which emails the student wants to receive. */
export interface NotificationPreferences {
  notifyAnnouncements: boolean;
  notifyAccountActivity: boolean;
  /** Enrollment confirmation, payment receipts and new-grade notices. */
  notifySchoolRecords: boolean;
}

export const portalService = {
  overview: () => api.get<StudentOverview>("/me/overview"),
  profile: () => api.get<MyProfile>("/me/profile"),
  updateProfile: (changes: Partial<StudentProfileFields>) => api.put<MyProfile>("/me/profile", changes),
  grades: () => api.get<AcademicHistory>("/me/grades"),
  reportCard: (semesterId?: number) =>
    api.get<{ availableTerms: Array<{ semesterId: number; label: string }>; reportCard: ReportCard | null }>("/me/report-card", { semesterId }),
  schedule: () => api.get<{ term: { id: number; label: string } | null; sectionName: string | null; slots: Schedule[] }>("/me/schedule"),
  balance: () => api.get<StudentStatement>("/me/balance"),
  paymentHistory: () => api.get<StudentPayment[]>("/me/payment-history"),
  announcements: () => api.get<Announcement[]>("/me/announcements"),
  preferences: () => api.get<NotificationPreferences>("/me/notification-preferences"),
  updatePreferences: (body: NotificationPreferences) => api.put<NotificationPreferences>("/me/notification-preferences", body),
};
