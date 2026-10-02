// Dropdown data (terms, programs, sections, subjects...) shared across pages.
// Each list is fetched once and cached; call invalidateLookups() after editing
// reference data on the Settings page.
import { academicService, termsFromYears } from "@/services/academic.service";
import { useApi } from "./useApi";

const cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) {
    const promise = load().catch((error) => {
      cache.delete(key); // retry next time
      throw error;
    });
    cache.set(key, promise);
  }
  return cache.get(key) as Promise<T>;
}

export function invalidateLookups() {
  cache.clear();
}

export function useAcademicYears() {
  return useApi(() => cached("academicYears", academicService.academicYears), []);
}

/** All terms (newest first) + the current one. */
export function useTerms() {
  const years = useAcademicYears();
  const terms = years.data ? termsFromYears(years.data) : [];
  return { ...years, terms, currentTerm: terms.find((term) => term.isCurrent) ?? terms[0] ?? null };
}

export function usePrograms() {
  return useApi(() => cached("programs", academicService.programs), []);
}

export function useSections(academicYearId?: number) {
  return useApi(() => (academicYearId ? cached(`sections:${academicYearId}`, () => academicService.sections({ academicYearId })) : Promise.resolve([])), [academicYearId]);
}

export function useSubjects() {
  return useApi(() => cached("subjects", academicService.subjects), []);
}

export function useInstructors() {
  return useApi(() => cached("instructors", academicService.instructors), []);
}

export function useRooms() {
  return useApi(() => cached("rooms", academicService.rooms), []);
}
