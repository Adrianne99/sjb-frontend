export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";

export interface Program {
  id: number;
  code: string;
  name: string;
  level: string;
  description: string | null;
  durationYears: number;
  /** Year levels this program has, e.g. [11, 12] for Senior High, [1, 2] for IT and HRS. */
  yearLevels: number[];
  isActive: boolean;
}

export interface Semester {
  id: number;
  academicYearId: number;
  academicYearName: string | null;
  name: string;
  termNumber: number;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  /** "First Semester, 2026-2027" */
  label: string;
}

export interface AcademicYear {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  semesters: Semester[];
}

export interface Section {
  id: number;
  name: string;
  programId: number;
  programCode: string | null;
  yearLevel: number;
  academicYearId: number;
  academicYearName: string | null;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  units: number;
  description: string | null;
  isActive: boolean;
}

export interface Instructor {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  isActive: boolean;
}

export interface Room {
  id: number;
  code: string;
  name: string | null;
  capacity: number | null;
  isActive: boolean;
}

export interface Schedule {
  id: number;
  semesterId: number;
  termLabel: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  subject: { id: number; code: string; name: string; units: number };
  section: { id: number; name: string; yearLevel: number; programCode: string };
  instructor: { id: number; fullName: string };
  mode: ClassMode;
  /** null for online classes. */
  room: { id: number; code: string; name: string | null } | null;
}

/** Face to face (in a room) or online (no room). */
export type ClassMode = "FACE_TO_FACE" | "ONLINE";

export interface ScheduleConflict {
  reasons: Array<"instructor" | "room" | "section">;
  schedule: Schedule;
  message: string;
}
