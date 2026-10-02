import type { Payment, PaymentMethod, QueryParams } from "@/types";
import { api } from "./api";

export interface RecordPaymentInput {
  enrollmentId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  remarks: string | null;
}

export const paymentService = {
  list: (query: QueryParams) => api.list<Payment>("/payments", query),
  get: (id: number) => api.get<Payment>(`/payments/${id}`),
  record: (input: RecordPaymentInput) => api.post<Payment>("/payments", input),
  update: (id: number, input: { paymentDate: string; paymentMethod: PaymentMethod; referenceNumber: string; remarks: string | null }) =>
    api.put<Payment>(`/payments/${id}`, input),
  void: (id: number, reason: string) => api.post<Payment>(`/payments/${id}/void`, { reason }),
};
