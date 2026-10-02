import type { AppliedFees, AvailableClass, Enrollment, EnrollmentDetail, EnrollmentStatus, ExtraSubject, PaymentPlan, QueryParams, ReportCard } from "@/types";
import { api } from "./api";

export interface EnrollmentInput {
  studentId: number;
  semesterId: number;
  programId: number;
  yearLevel: number;
  sectionId: number | null;
  enrollmentDate: string;
  status: EnrollmentStatus;
  remarks: string | null;
  assessments?: Array<{ description: string; amount: number }>;
}

export const enrollmentService = {
  list: (query: QueryParams) => api.list<Enrollment>("/enrollments", query),
  get: (id: number) => api.get<EnrollmentDetail>(`/enrollments/${id}`),
  create: (input: EnrollmentInput) => api.post<EnrollmentDetail>("/enrollments", input),
  update: (id: number, input: Omit<EnrollmentInput, "studentId" | "semesterId" | "programId" | "assessments">) =>
    api.put<EnrollmentDetail>(`/enrollments/${id}`, input),
  addAssessment: (id: number, item: { description: string; amount: number }) =>
    api.post<EnrollmentDetail>(`/enrollments/${id}/assessments`, item),
  updateAssessment: (id: number, assessmentId: number, item: { description: string; amount: number }) =>
    api.put<EnrollmentDetail>(`/enrollments/${id}/assessments/${assessmentId}`, item),
  /** Tuition line: change the units; the server calculates units × rate. */
  updateTuitionUnits: (id: number, assessmentId: number, units: number) =>
    api.put<EnrollmentDetail>(`/enrollments/${id}/assessments/${assessmentId}/units`, { units }),
  // Tuition fee options: preview first, then apply (once per enrollment).
  applyFees: (id: number, body: { plan: PaymentPlan; units?: number | null; preview: boolean }) => api.post<AppliedFees>(`/enrollments/${id}/apply-fees`, body),
  // Irregular students: subjects taken with another section.
  extraSubjects: (id: number) => api.get<ExtraSubject[]>(`/enrollments/${id}/subjects`),
  availableClasses: (id: number) => api.get<AvailableClass[]>(`/enrollments/${id}/available-classes`),
  addExtraSubject: (id: number, body: { sectionId: number; subjectId: number; chargeCrossEnrollmentFee: boolean }) => api.post<ExtraSubject[]>(`/enrollments/${id}/subjects`, body),
  removeExtraSubject: (id: number, extraId: number) => api.delete<ExtraSubject[]>(`/enrollments/${id}/subjects/${extraId}`),

  reportCard: (id: number, includeDrafts = false) =>
    api.get<ReportCard>(`/enrollments/${id}/report-card`, { includeDrafts: includeDrafts ? "true" : undefined }),
};
