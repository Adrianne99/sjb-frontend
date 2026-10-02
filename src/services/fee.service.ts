import type { FeeSchedule, FeeTable } from "@/types";
import { api } from "./api";

/** The editable numbers of a fee table row. */
export type FeeScheduleInput = Pick<
  FeeSchedule,
  "programId" | "yearLevel" | "units" | "ratePerUnit" | "miscFee" | "downPayment" | "prelimPayment" | "midtermPayment" | "earlyBirdDiscount" | "cashDiscount" | "annualTuition" | "isActive"
>;

export const feeService = {
  /** Tuition fee options shown on the public website. */
  listPublic: () => api.get<FeeTable>("/fees/public"),
  list: () => api.get<FeeTable>("/fees"),
  create: (input: FeeScheduleInput) => api.post<FeeSchedule>("/fees", input),
  update: (id: number, input: FeeScheduleInput) => api.put<FeeSchedule>(`/fees/${id}`, input),
  updateCrossEnrollmentFee: (amount: number) => api.put<string>("/fees/cross-enrollment-fee", { amount }),
};
