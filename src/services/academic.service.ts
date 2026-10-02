// Reference data used by dropdowns and the Settings screen.
import type { AcademicYear, Instructor, Program, Room, Section, Semester, Subject } from "@/types";
import { api } from "./api";

export const academicService = {
  currentTerm: () => api.get<Semester | null>("/academic/current-term"),

  programs: () => api.get<Program[]>("/academic/programs"),
  createProgram: (body: Partial<Program>) => api.post<Program>("/academic/programs", body),
  updateProgram: (id: number, body: Partial<Program>) => api.put<Program>(`/academic/programs/${id}`, body),

  academicYears: () => api.get<AcademicYear[]>("/academic/academic-years"),
  createAcademicYear: (body: { name: string; startDate: string; endDate: string }) => api.post<AcademicYear>("/academic/academic-years", body),
  updateAcademicYear: (id: number, body: { name: string; startDate: string; endDate: string }) =>
    api.put<AcademicYear>(`/academic/academic-years/${id}`, body),
  createSemester: (body: Partial<Semester>) => api.post<Semester>("/academic/semesters", body),
  updateSemester: (id: number, body: Partial<Semester>) => api.put<Semester>(`/academic/semesters/${id}`, body),
  setCurrentSemester: (id: number) => api.post<Semester>(`/academic/semesters/${id}/set-current`),

  sections: (filters: { academicYearId?: number; programId?: number; yearLevel?: number } = {}) =>
    api.get<Section[]>("/academic/sections", filters),
  createSection: (body: Partial<Section>) => api.post<Section>("/academic/sections", body),
  updateSection: (id: number, body: Partial<Section>) => api.put<Section>(`/academic/sections/${id}`, body),

  subjects: () => api.get<Subject[]>("/academic/subjects"),
  createSubject: (body: Partial<Subject>) => api.post<Subject>("/academic/subjects", body),
  updateSubject: (id: number, body: Partial<Subject>) => api.put<Subject>(`/academic/subjects/${id}`, body),

  instructors: () => api.get<Instructor[]>("/academic/instructors"),
  createInstructor: (body: Partial<Instructor>) => api.post<Instructor>("/academic/instructors", body),
  updateInstructor: (id: number, body: Partial<Instructor>) => api.put<Instructor>(`/academic/instructors/${id}`, body),

  rooms: () => api.get<Room[]>("/academic/rooms"),
  createRoom: (body: Partial<Room>) => api.post<Room>("/academic/rooms", body),
  updateRoom: (id: number, body: Partial<Room>) => api.put<Room>(`/academic/rooms/${id}`, body),
};

/** Flattens academic years into a sorted list of terms (newest first). */
export function termsFromYears(years: AcademicYear[]): Semester[] {
  return years.flatMap((year) => [...year.semesters].sort((a, b) => b.termNumber - a.termNumber));
}
