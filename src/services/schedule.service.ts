import type { ClassMode, DayOfWeek, QueryParams, Schedule } from "@/types";
import { api } from "./api";

export interface ScheduleInput {
  semesterId: number;
  subjectId: number;
  sectionId: number;
  instructorId: number;
  mode: ClassMode;
  /** null for online classes. */
  roomId: number | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

export const scheduleService = {
  list: (query: QueryParams) => api.get<Schedule[]>("/schedules", query),
  create: (input: ScheduleInput) => api.post<Schedule>("/schedules", input),
  update: (id: number, input: ScheduleInput) => api.put<Schedule>(`/schedules/${id}`, input),
  remove: (id: number) => api.delete<null>(`/schedules/${id}`),
};
