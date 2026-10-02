import type { EnrollmentStatus, StudentSummary } from "./students";

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "GCASH" | "MAYA" | "CHECK" | "OTHER";
export type PaymentStatus = "RECORDED" | "VOIDED";

/** Money values are strings like "30000.00" — calculated by the backend. */
export interface BalanceSummary {
  totalAssessed: string;
  totalPaid: string;
  balance: string;
}

export interface StatementTerm extends BalanceSummary, PaymentPlanInfo {
  enrollmentId: number;
  semesterId: number;
  termLabel: string;
  academicYear: string;
  semesterName: string;
  enrollmentStatus: EnrollmentStatus;
  isCurrent: boolean;
  assessments: Array<{ id: number; description: string; amount: string }>;
}

export interface StudentStatement extends BalanceSummary {
  terms: StatementTerm[];
}

/** Payment as seen by staff. */
export interface Payment {
  id: number;
  enrollmentId: number;
  referenceNumber: string;
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  remarks: string | null;
  status: PaymentStatus;
  voidReason: string | null;
  voidedAt: string | null;
  voidedBy: string | null;
  recordedBy: string | null;
  createdAt: string;
  semesterId: number;
  academicYearName: string;
  semesterName: string;
  termLabel: string;
  student: StudentSummary;
  termBalance?: BalanceSummary;
}

/** Payment as seen by the student. */
export interface StudentPayment {
  id: number;
  referenceNumber: string;
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  termLabel: string;
}

// --- Tuition fee options -------------------------------------------------------

export type PaymentPlan = "INSTALLMENT" | "EARLY_BIRD" | "CASH" | "SHS_NO_VOUCHER" | "SHS_VOUCHER";

/** One part of a term's payment schedule (e.g. "Prelim exam payment"). */
export interface Installment {
  label: string;
  amount: string;
  paid: string;
  remaining: string;
  status: "PAID" | "PARTIAL" | "DUE";
}

/** The payment option chosen for one enrollment, and its schedule. */
export interface PaymentPlanInfo {
  paymentPlan: PaymentPlan | null;
  paymentPlanLabel: string | null;
  paymentSchedule: Installment[];
}

/** One row of the tuition fee table (program + year level). Amounts are numbers here. */
export interface FeeSchedule {
  id: number;
  programId: number;
  programCode: string;
  programName: string;
  yearLevel: number;
  yearLevelLabel: string;
  units: number;
  ratePerUnit: number;
  miscFee: number;
  downPayment: number;
  prelimPayment: number;
  midtermPayment: number;
  earlyBirdDiscount: number;
  cashDiscount: number;
  /** Senior High only: whole-year tuition. */
  annualTuition: number | null;
  isActive: boolean;
  plans: PaymentPlan[];
  // Calculated by the backend (money strings).
  total: string;
  finalPayment: string;
  earlyBirdTotal: string;
  cashTotal: string;
}

export interface FeeTable {
  schedules: FeeSchedule[];
  crossEnrollmentFee: string;
}

/** Result of applying (or previewing) tuition fees on an enrollment. */
export interface AppliedFees {
  plan: PaymentPlan;
  planLabel: string;
  lines: Array<{ description: string; amount: string }>;
  total: string;
  note: string | null;
  /** Units used for the tuition line. */
  units: number;
  /** Where the default units come from: own section (or fee table) + extra subjects. */
  unitsDetail: { base: number; baseSource: "section" | "fee table"; extra: number; extraSubjects: number; total: number };
}
