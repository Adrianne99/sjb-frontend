// Admission requirements (Form 137, Diploma, Report Card / Form 138, Good Moral)
// and irregular students' extra subjects.
import type { Schedule } from "./academic";
import type { StudentSummary } from "./students";

export type RequirementStatus = "PENDING" | "SUBMITTED" | "VERIFIED";

export interface RequirementType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export type PublicRequirement = Pick<RequirementType, "id" | "code" | "name" | "description">;

export interface StudentRequirementItem {
  requirement: PublicRequirement;
  status: RequirementStatus;
  submittedDate: string | null;
  remarks: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface StudentChecklist {
  items: StudentRequirementItem[];
  summary: { total: number; verified: number; submitted: number; pending: number; complete: boolean };
}

export interface ComplianceRow {
  student: StudentSummary;
  /** requirementTypeId -> status */
  statuses: Record<number, RequirementStatus>;
  verified: number;
  total: number;
  complete: boolean;
}

/** A subject an irregular student takes with another section. */
export interface ExtraSubject {
  id: number;
  subject: { id: number; code: string; name: string; units: number };
  section: { id: number; name: string };
  hasGrade: boolean;
  slots: Schedule[];
}

/** A class the student could add, with any clash already detected by the server. */
export interface AvailableClass {
  section: Schedule["section"];
  subject: Schedule["subject"];
  instructor: Schedule["instructor"];
  slots: Schedule[];
  conflictsWith: string[];
}
