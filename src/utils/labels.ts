// Human-readable labels for values that come from the API as codes.
import { formatYearLevel } from "./format";
import type {
  AnnouncementAudience,
  AnnouncementCategory,
  AnnouncementStatus,
  ApplicantType,
  ApplicationStatus,
  ClassMode,
  DayOfWeek,
  EnrollmentStatus,
  GradeRemark,
  GradeStatus,
  PaymentMethod,
  PaymentPlan,
  PaymentStatus,
  Program,
  RequirementStatus,
  StudentProfileField,
  StudentStatus,
} from "@/types";

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  PENDING: "Pending",
  ENROLLED: "Enrolled",
  DROPPED: "Dropped",
  WITHDRAWN: "Withdrawn",
  COMPLETED: "Completed",
};

export const STUDENT_STATUS_LABELS: Record<StudentStatus, string> = {
  ACTIVE: "Active",
  GRADUATED: "Graduated",
  ARCHIVED: "Archived",
};

export const GRADE_STATUS_LABELS: Record<GradeStatus, string> = { DRAFT: "Draft", PUBLISHED: "Published" };

export const GRADE_REMARK_LABELS: Record<GradeRemark, string> = {
  PASSED: "Passed",
  FAILED: "Failed",
  INCOMPLETE: "Incomplete",
  DROPPED: "Dropped",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank transfer",
  GCASH: "GCash",
  MAYA: "Maya",
  CHECK: "Check",
  OTHER: "Other",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = { RECORDED: "Recorded", VOIDED: "Voided" };

export const ANNOUNCEMENT_STATUS_LABELS: Record<AnnouncementStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const ANNOUNCEMENT_CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  GENERAL: "General",
  ACADEMIC: "Academic",
  EVENT: "Event",
  ANNOUNCEMENT: "Announcement",
};

export const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  PUBLIC: "Public & students",
  STUDENTS: "Students only",
};

export const DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export const PROFILE_FIELD_LABELS: Record<StudentProfileField, string> = {
  email: "Personal email",
  contactNumber: "Contact number",
  addressLine: "Street address",
  barangay: "Barangay",
  city: "City / Municipality",
  province: "Province",
  zipCode: "ZIP code",
  guardianName: "Guardian name",
  guardianRelationship: "Guardian relationship",
  guardianContactNumber: "Guardian contact number",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: "Waiting for visit",
  CONVERTED: "Student record created",
  REJECTED: "Rejected",
};

export const APPLICANT_TYPE_LABELS: Record<ApplicantType, string> = {
  NEW: "New student",
  TRANSFEREE: "Transferee",
  RETURNING: "Returning student",
};

export const REQUIREMENT_STATUS_LABELS: Record<RequirementStatus, string> = {
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  VERIFIED: "Verified",
};

export const CLASS_MODE_LABELS: Record<ClassMode, string> = { FACE_TO_FACE: "Face to face", ONLINE: "Online" };

export const PAYMENT_PLAN_LABELS: Record<PaymentPlan, string> = {
  INSTALLMENT: "Installment",
  EARLY_BIRD: "Early bird payment",
  CASH: "Cash payment",
  SHS_NO_VOUCHER: "Without voucher",
  SHS_VOUCHER: "With voucher",
};

/** One-line explanation of each payment option (from the school's fee poster). */
export const PAYMENT_PLAN_HINTS: Record<PaymentPlan, string> = {
  INSTALLMENT: "Down payment, then prelim, midterm and final exam payments.",
  EARLY_BIRD: "Less the early-bird discount. Paid in full 1 month before the term starts.",
  CASH: "Less the cash discount. Paid in full up to the first day of classes.",
  SHS_NO_VOUCHER: "Whole-year tuition, charged once per school year.",
  SHS_VOUCHER: "Tuition is free with a Senior High voucher.",
};

/** Year-level options for ONE program, e.g. Grade 11 / Grade 12, or 1st Year / 2nd Year. */
export function yearLevelOptions(levels: number[]) {
  return levels.map((level) => ({ value: String(level), label: formatYearLevel(level) }));
}

/** Every year level used by the given programs (for filters): Grade 11, Grade 12, 1st Year, 2nd Year. */
export function allYearLevelOptions(programs: Program[] = []) {
  const levels = [...new Set(programs.flatMap((program) => program.yearLevels))];
  // Senior High grades first, then college years.
  const order = (level: number) => (level >= 7 ? level - 100 : level);
  return yearLevelOptions(levels.sort((a, b) => order(a) - order(b)));
}

/** Turns any enum-like map into <Select> options. */
export function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
