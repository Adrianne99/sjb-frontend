import type { BalanceSummary, PaymentPlanInfo } from "./finance";

export type Sex = "MALE" | "FEMALE";
export type StudentStatus = "ACTIVE" | "GRADUATED" | "ARCHIVED";
export type EnrollmentStatus = "PENDING" | "ENROLLED" | "DROPPED" | "WITHDRAWN" | "COMPLETED";

export interface StudentSummary {
  id: number;
  studentNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  fullName: string;
  formalName: string;
  status: StudentStatus;
  programId: number;
  programCode: string | null;
  programName: string | null;
}

export interface StudentListItem extends StudentSummary {
  currentEnrollment: { id: number; status: EnrollmentStatus; yearLevel: number; sectionName: string | null; irregular: boolean } | null;
  hasAccount: boolean;
  balance: string;
}

export interface StudentProfileFields {
  email: string | null;
  contactNumber: string | null;
  addressLine: string | null;
  barangay: string | null;
  city: string | null;
  province: string | null;
  zipCode: string | null;
  guardianName: string | null;
  guardianRelationship: string | null;
  guardianContactNumber: string | null;
}

export type StudentProfileField = keyof StudentProfileFields;

export interface Enrollment {
  id: number;
  studentId: number;
  semesterId: number;
  academicYearId: number;
  academicYearName: string;
  semesterName: string;
  termLabel: string;
  isCurrentTerm: boolean;
  programId: number;
  programCode: string;
  programName: string;
  yearLevel: number;
  sectionId: number | null;
  sectionName: string | null;
  enrollmentDate: string;
  status: EnrollmentStatus;
  remarks: string | null;
  createdAt: string;
  student?: StudentSummary;
  balance?: BalanceSummary;
}

export interface Assessment {
  id: number;
  description: string;
  amount: string;
  createdAt?: string;
  /** Set for the per-unit tuition line (edit the units; the amount is calculated). */
  tuitionUnits?: { units: number; ratePerUnit: number } | null;
}

export interface EnrollmentDetail extends Enrollment, PaymentPlanInfo {
  balance: BalanceSummary;
  assessments: Assessment[];
}

export interface StudentAccountInfo {
  userId: number;
  username: string;
  email: string | null;
  isActive: boolean;
  mustChangePassword: boolean;
  isLocked: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface StudentDetail extends StudentSummary {
  dateOfBirth: string;
  sex: Sex;
  createdAt: string;
  archivedAt: string | null;
  profile: StudentProfileFields;
  account: StudentAccountInfo | null;
  currentEnrollment: Enrollment | null;
  enrollments: Enrollment[];
  balance: BalanceSummary;
}

/** Body for POST /api/students and PUT /api/students/:id */
export interface StudentFormValues {
  studentNumber?: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  dateOfBirth: string;
  sex: Sex | "";
  programId: number | "";
  status?: "ACTIVE" | "GRADUATED";
  profile: StudentProfileFields;
  initialEnrollment?: { semesterId: number; yearLevel: number; sectionId: number | null; status: "PENDING" | "ENROLLED" } | null;
  createAccount?: boolean;
}
