// Online pre-registration ("Enroll Now").
import type { Sex, StudentDetail } from "./students";

export type ApplicationStatus = "SUBMITTED" | "CONVERTED" | "REJECTED";
export type ApplicantType = "NEW" | "TRANSFEREE" | "RETURNING";

/** Programs, year levels and documents for the public form. */
export interface ApplicationFormOptions {
  programs: Array<{ id: number; code: string; name: string; level: string; yearLevels: Array<{ value: number; label: string }> }>;
  requirements: Array<{ name: string; description: string | null }>;
}

/** What the public form sends. */
export interface ApplicationInput {
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  dateOfBirth: string;
  sex: Sex | "";
  email: string;
  contactNumber: string;
  addressLine: string | null;
  barangay: string | null;
  city: string | null;
  province: string | null;
  zipCode: string | null;
  guardianName: string | null;
  guardianRelationship: string | null;
  guardianContactNumber: string | null;
  programId: number | null;
  yearLevel: number | null;
  applicantType: ApplicantType | "";
  previousSchool: string | null;
  privacyConsent: boolean;
  /** Hidden anti-spam field; must stay empty. */
  website: string;
}

/** Shown to the applicant after submitting. */
export interface ApplicationReceipt {
  referenceNumber: string;
  firstName: string;
  program: string;
  yearLevel: string;
  email: string;
  feeNote: string | null;
}

/** An application as staff see it. */
export interface Application {
  id: number;
  referenceNumber: string;
  status: ApplicationStatus;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  fullName: string;
  dateOfBirth: string;
  sex: Sex;
  email: string;
  contactNumber: string;
  addressLine: string | null;
  barangay: string | null;
  city: string | null;
  province: string | null;
  zipCode: string | null;
  guardianName: string | null;
  guardianRelationship: string | null;
  guardianContactNumber: string | null;
  program: { id: number; code: string; name: string; level: string };
  yearLevel: number;
  yearLevelLabel: string;
  applicantType: ApplicantType;
  previousSchool: string | null;
  remarks: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  student: { id: number; studentNumber: string } | null;
  createdAt: string;
}

export interface ApplicationDetail extends Application {
  /** Existing students with the same name and birthdate. */
  possibleMatches: Array<{ id: number; studentNumber: string; firstName: string; lastName: string; status: string }>;
}

export interface ConvertedApplication {
  application: ApplicationDetail;
  student: StudentDetail;
}
