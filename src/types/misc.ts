import type { Schedule } from "./academic";
import type { Role } from "./auth";
import type { BalanceSummary, Payment } from "./finance";
import type { Grade } from "./grades";
import type { Enrollment, StudentSummary } from "./students";

// --- Announcements -------------------------------------------------------------
export type AnnouncementStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AnnouncementAudience = "PUBLIC" | "STUDENTS";

export interface Announcement {
  id: number;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  status?: AnnouncementStatus;
  publishDate: string;
  expirationDate: string | null;
  createdBy?: string | null;
  updatedAt: string;
  /** Cover photo path (use apiUrl() to build the full URL), or null. */
  imagePath?: string | null;
  /** Staff only: when it was emailed to students (null = not yet). */
  emailedAt?: string | null;
}

// --- Audit logs -----------------------------------------------------------------
export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  ipAddress: string | null;
  metadata: unknown;
  createdAt: string;
  user: { id: number; username: string; role: Role } | null;
}

// --- Dashboard & reports --------------------------------------------------------
export interface DashboardData {
  currentTerm: { id: number; label: string } | null;
  stats: {
    totalStudents: number;
    currentlyEnrolled: number;
    pendingEnrollment: number;
    studentsWithBalance: number;
    outstandingTotal: string;
  };
  enrollmentByYearLevel: Array<{ yearLevel: number; count: number }>;
  collectionsByMonth: Array<{ month: string; total: string }>;
  recentEnrollments: Enrollment[];
  recentPayments: Payment[];
  recentGradeUpdates: Grade[];
  upcomingClasses: Schedule[];
  recentActivity: AuditLog[];
}

export interface EnrollmentSummaryReport {
  term: { id: number; label: string } | null;
  rows: Array<{ programCode: string; programName: string; yearLevel: number; counts: Record<string, number>; total: number }>;
  totals: Record<string, number>;
}

export interface CollectionsReport {
  dateFrom: string;
  dateTo: string;
  total: string;
  paymentCount: number;
  voidedCount: number;
  voidedTotal: string;
  byMethod: Array<{ paymentMethod: string; total: string; count: number }>;
  byDay: Array<{ date: string; total: string; count: number }>;
}

export interface OutstandingBalanceRow extends BalanceSummary {
  student: StudentSummary;
}

// --- Student portal ------------------------------------------------------------
export interface StudentOverview {
  student: StudentSummary & { programName: string };
  currentTerm: { id: number; label: string } | null;
  currentEnrollment: { status: Enrollment["status"]; yearLevel: number; sectionName: string | null } | null;
  gradingScale: string;
  overallAverage: string | null;
  currentTermAverage: string | null;
  balance: BalanceSummary;
  nextClass: (Schedule & { isToday: boolean; isOngoing: boolean }) | null;
  academicStatus: { label: string; tone: "neutral" | "success" | "warning" };
  announcements: Announcement[];
}

// --- Chatbot -------------------------------------------------------------------
export interface ChatbotReply {
  reply: string;
  category: "faq" | "privacy" | "greeting" | "fallback" | "ai" | "out_of_scope";
  topic?: string;
  suggestions: string[];
}
