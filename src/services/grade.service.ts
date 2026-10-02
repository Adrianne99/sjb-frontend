import type { ClassOffering, ClassRoster, Grade, GradeHistoryEntry, GradeRemark, GradingConfig, QueryParams } from "@/types";
import { api } from "./api";

export interface ClassSelector {
  semesterId: number;
  sectionId: number;
  subjectId: number;
}

export interface GradeEntry {
  enrollmentId: number;
  grade: number | null;
  remark: GradeRemark | null;
}

export const gradeService = {
  list: (query: QueryParams) => api.list<Grade>("/grades", query),
  classes: (semesterId?: number) => api.get<ClassOffering[]>("/grades/classes", { semesterId }),
  roster: (selector: ClassSelector) => api.get<ClassRoster>("/grades/roster", { ...selector }),
  saveClass: (selector: ClassSelector, entries: GradeEntry[]) =>
    api.post<{ created: number; updated: number; skippedPublished: number; roster: ClassRoster }>("/grades/bulk", { ...selector, entries }),
  publishClass: (selector: ClassSelector) => api.post<{ published: number; studentsWithoutGrade: number }>("/grades/publish", selector),
  update: (id: number, body: { grade: number | null; remark: GradeRemark | null; reason?: string | null }) =>
    api.put<Grade>(`/grades/${id}`, body),
  publish: (id: number) => api.post<Grade>(`/grades/${id}/publish`),
  history: (id: number) => api.get<GradeHistoryEntry[]>(`/grades/${id}/history`),
  gradingConfig: () => api.get<GradingConfig>("/settings/grading"),
};
