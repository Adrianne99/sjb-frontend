// Admission requirements: Form 137, Diploma, Report Card (Form 138), Good Moral.
import type { ComplianceRow, PublicRequirement, QueryParams, RequirementStatus, RequirementType, StudentChecklist } from "@/types";
import { api } from "./api";

export interface RequirementTypeInput {
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export const requirementService = {
  /** Public list shown on the landing page. */
  listPublic: () => api.get<PublicRequirement[]>("/requirements/public"),

  types: () => api.get<RequirementType[]>("/requirements/types"),
  createType: (input: RequirementTypeInput) => api.post<RequirementType>("/requirements/types", input),
  updateType: (id: number, input: RequirementTypeInput) => api.put<RequirementType>(`/requirements/types/${id}`, input),

  /** Who has / is missing which document. Also returns the active `types` in the envelope. */
  compliance: (query: QueryParams) => api.list<ComplianceRow>("/requirements/compliance", query),

  studentChecklist: (studentId: number) => api.get<StudentChecklist>(`/students/${studentId}/requirements`),
  updateStudent: (studentId: number, requirementId: number, body: { status: RequirementStatus; submittedDate: string | null; remarks: string | null }) =>
    api.put<StudentChecklist>(`/students/${studentId}/requirements/${requirementId}`, body),
};
