import type {
  AcademicHistory,
  IssuedCredentials,
  Payment,
  QueryParams,
  StudentDetail,
  StudentFormValues,
  StudentListItem,
  StudentStatement,
} from "@/types";
import { api } from "./api";

export const studentService = {
  list: (query: QueryParams) => api.list<StudentListItem>("/students", query),
  get: (id: number) => api.get<StudentDetail>(`/students/${id}`),
  create: (values: StudentFormValues) =>
    api.post<{ student: StudentDetail; credentials: IssuedCredentials | null }>("/students", values),
  update: (id: number, values: StudentFormValues) => api.put<StudentDetail>(`/students/${id}`, values),
  archive: (id: number) => api.post<StudentDetail>(`/students/${id}/archive`),
  restore: (id: number) => api.post<StudentDetail>(`/students/${id}/restore`),

  grades: (id: number) => api.get<AcademicHistory>(`/students/${id}/grades`),
  balance: (id: number) => api.get<StudentStatement>(`/students/${id}/balance`),
  payments: (id: number) => api.get<Payment[]>(`/students/${id}/payments`),

  createAccount: (id: number, body: { email?: string | null; sendEmail?: boolean }) =>
    api.post<IssuedCredentials>(`/students/${id}/account`, body),
  resetPassword: (id: number) => api.post<IssuedCredentials>(`/students/${id}/account/reset-password`),
  setAccountActive: (id: number, isActive: boolean) => api.put<{ isActive: boolean }>(`/students/${id}/account/status`, { isActive }),
};
