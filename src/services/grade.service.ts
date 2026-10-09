import type { ApiEnvelope, ClassOffering, ClassRoster, Grade, GradeHistoryEntry, GradeRemark, GradeSubmission, GradingConfig, QueryParams } from "@/types";
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

/** What the grade sheet needs: staff use /grades (gradeService), teachers use /teaching (teachingService). */
export interface GradeSource {
  classes: (semesterId?: number) => Promise<ClassOffering[]>;
  roster: (selector: ClassSelector) => Promise<ClassRoster>;
  saveClass: (selector: ClassSelector, entries: GradeEntry[]) => Promise<ApiEnvelope<{ created: number; updated: number; skippedPublished: number; roster: ClassRoster }>>;
}

export const gradeService = {
  list: (query: QueryParams) => api.list<Grade>("/grades", query),
  classes: (semesterId?: number) => api.get<ClassOffering[]>("/grades/classes", { semesterId }),
  roster: (selector: ClassSelector) => api.get<ClassRoster>("/grades/roster", { ...selector }),
  saveClass: (selector: ClassSelector, entries: GradeEntry[]) =>
    api.post<{ created: number; updated: number; skippedPublished: number; roster: ClassRoster }>("/grades/bulk", { ...selector, entries }),
  /** Staff send a teacher's submitted grades back with a note. */
  returnClass: (selector: ClassSelector, note: string) => api.post<GradeSubmission>("/grades/return", { ...selector, note }),
  /** Classes teachers submitted that are waiting for staff. */
  pendingSubmissions: () => api.get<Array<GradeSubmission & { semesterId: number; section: { id: number; name: string }; subject: { id: number; code: string; name: string }; instructor: string | null }>>("/grades/submissions/pending"),
  publishClass: (selector: ClassSelector) => api.post<{ published: number; studentsWithoutGrade: number }>("/grades/publish", selector),
  update: (id: number, body: { grade: number | null; remark: GradeRemark | null; reason?: string | null }) =>
    api.put<Grade>(`/grades/${id}`, body),
  publish: (id: number) => api.post<Grade>(`/grades/${id}/publish`),
  history: (id: number) => api.get<GradeHistoryEntry[]>(`/grades/${id}/history`),
  gradingConfig: () => api.get<GradingConfig>("/settings/grading"),
};
