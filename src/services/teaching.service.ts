// Teacher API (/api/teaching): the logged-in teacher's own schedule, classes,
// class lists and DRAFT grades. The backend works out which instructor the
// teacher is from the login — the browser never sends an instructor ID.
import type { Announcement, ClassOffering, ClassRoster, DayOfWeek, GradeSubmission, Schedule } from "@/types";
import { api } from "./api";
import type { ClassSelector, GradeEntry, GradeSource } from "./grade.service";

export interface TeacherSchedule {
  instructor: { id: number; fullName: string };
  semesterId: number | null;
  slots: Schedule[];
}

export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

interface AttendanceStudent {
  id: number;
  studentNumber: string;
  fullName: string;
  formalName: string;
}

export interface AttendanceSheet {
  date: string;
  meetingDays: DayOfWeek[];
  /** False when the class does not normally meet on this weekday. */
  meetsOnThisDay: boolean;
  students: Array<{ enrollmentId: number; student: AttendanceStudent; irregular: boolean; status: AttendanceStatus | null }>;
}

export interface AttendanceSummary {
  dates: string[];
  students: Array<{ enrollmentId: number; student: AttendanceStudent; present: number; late: number; absent: number; excused: number }>;
}

export const teachingService = {
  schedule: (semesterId?: number) => api.get<TeacherSchedule>("/teaching/schedule", { semesterId }),
  classes: (semesterId?: number) => api.get<ClassOffering[]>("/teaching/classes", { semesterId }),
  roster: (selector: ClassSelector) => api.get<ClassRoster>("/teaching/roster", { ...selector }),
  /** Saves grades as DRAFTS (staff publish them). */
  saveClass: (selector: ClassSelector, entries: GradeEntry[]) =>
    api.post<{ created: number; updated: number; skippedPublished: number; roster: ClassRoster }>("/teaching/grades", { ...selector, entries }),
  /** "Submit for review": locks the grade sheet until staff publish or return it. */
  submit: (selector: ClassSelector) => api.post<GradeSubmission>("/teaching/grades/submit", selector),
  attendance: (selector: ClassSelector, date: string) => api.get<AttendanceSheet>("/teaching/attendance", { ...selector, date }),
  saveAttendance: (selector: ClassSelector, date: string, entries: Array<{ enrollmentId: number; status: AttendanceStatus }>) =>
    api.put<AttendanceSheet>("/teaching/attendance", { ...selector, date, entries }),
  attendanceSummary: (selector: ClassSelector) => api.get<AttendanceSummary>("/teaching/attendance/summary", { ...selector }),
  announcements: () => api.get<Announcement[]>("/teaching/announcements"),
} satisfies GradeSource & Record<string, unknown>;
