import type { Application, ApplicationDetail, ApplicationFormOptions, ApplicationInput, ApplicationReceipt, ConvertedApplication, QueryParams } from "@/types";
import { api } from "./api";

export const applicationService = {
  // Public ("Enroll Now")
  formOptions: () => api.get<ApplicationFormOptions>("/applications/form-options"),
  submit: (input: ApplicationInput) => api.post<ApplicationReceipt>("/applications", input),

  // Staff
  list: (query: QueryParams) => api.list<Application>("/applications", query),
  get: (id: number) => api.get<ApplicationDetail>(`/applications/${id}`),
  convert: (id: number, body: { semesterId: number; yearLevel?: number; sectionId: number | null }) => api.post<ConvertedApplication>(`/applications/${id}/convert`, body),
  reject: (id: number, remarks: string) => api.post<ApplicationDetail>(`/applications/${id}/reject`, { remarks }),
};
