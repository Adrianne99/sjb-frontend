import type { StudentSummary, EnrollmentStatus } from "./students";

export type GradeStatus = "DRAFT" | "PUBLISHED";
export type GradeRemark = "PASSED" | "FAILED" | "INCOMPLETE" | "DROPPED";

export interface GradingConfig {
  scaleLabel: string;
  minGrade: number;
  maxGrade: number;
  passingGrade: number;
  higherIsBetter: boolean;
  decimalPlaces: number;
}

/** Grade as seen by staff. */
export interface Grade {
  id: number;
  enrollmentId: number;
  semesterId: number;
  termLabel: string;
  sectionId: number | null;
  sectionName: string | null;
  subject: { id: number; code: string; name: string; units: number };
  instructorName: string | null;
  grade: number | null;
  gradeDisplay: string | null;
  remark: GradeRemark;
  status: GradeStatus;
  encodedAt: string;
  encodedBy: string;
  updatedAt: string;
  publishedAt: string | null;
  publishedBy: string | null;
  student: StudentSummary;
}

/** Grade row as seen by the student / on the report card. */
export interface SubjectGrade {
  id: number;
  subjectCode: string;
  subjectName: string;
  units: number;
  instructorName: string | null;
  grade: number | null;
  gradeDisplay: string | null;
  remark: GradeRemark;
  status: GradeStatus;
}

export interface ClassOffering {
  semesterId: number;
  subject: { id: number; code: string; name: string; units: number };
  section: { id: number; name: string; yearLevel: number; programCode: string };
  instructor: { id: number; fullName: string };
  studentCount: number;
  /** Students from other sections taking this subject here. */
  irregularCount: number;
  draftCount: number;
  publishedCount: number;
}

export interface ClassRoster {
  class: {
    termLabel: string;
    subject: ClassOffering["subject"];
    section: ClassOffering["section"];
    instructor: ClassOffering["instructor"];
  };
  gradingConfig: GradingConfig;
  students: Array<{ enrollmentId: number; student: StudentSummary; irregular: boolean; homeSectionName: string | null; grade: Grade | null }>;
}

interface GradeSummary {
  subjects: SubjectGrade[];
  average: number | null;
  averageDisplay: string | null;
  totalUnits: number;
  passedCount: number;
  failedCount: number;
}

export interface AcademicHistoryTerm extends GradeSummary {
  enrollmentId: number;
  semesterId: number;
  semesterName: string;
  termNumber: number;
  termLabel: string;
  isCurrent: boolean;
  enrollmentStatus: EnrollmentStatus;
  programCode: string;
  yearLevel: number;
  sectionName: string | null;
  gradingScale: string;
}

export interface AcademicHistory {
  gradingScale: string;
  overallAverage: number | null;
  overallAverageDisplay: string | null;
  years: Array<{ academicYearId: number; academicYearName: string; terms: AcademicHistoryTerm[] }>;
}

export interface ReportCard extends GradeSummary {
  enrollmentId: number;
  student: StudentSummary & { programName: string; programCode: string; yearLevel: number; sectionName: string | null };
  term: { semesterId: number; semesterName: string; academicYearName: string; label: string };
  enrollmentStatus: EnrollmentStatus;
  gradingScale: string;
  includesDrafts: boolean;
  generatedAt: string;
}

export interface GradeHistoryEntry {
  id: number;
  action: string;
  description: string;
  reason: string | null;
  user: string | null;
  createdAt: string;
}
