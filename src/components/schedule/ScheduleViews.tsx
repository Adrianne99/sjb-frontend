// Two ways to show class schedules:
//   <ScheduleList>   — grouped by day, cards (best on phones)
//   <WeeklySchedule> — a Monday–Saturday timetable grid (tablet/desktop)
import { Clock, DoorOpen, UserRound, Wifi } from "lucide-react";
import type { ReactNode } from "react";
import type { DayOfWeek, Schedule } from "@/types";
import { classLocation, formatTime, formatTimeRange } from "@/utils/format";
import { DAY_LABELS, DAYS } from "@/utils/labels";

function groupByDay(slots: Schedule[]) {
  return DAYS.map((day) => ({ day, slots: slots.filter((slot) => slot.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime)) })).filter(
    (group) => group.slots.length > 0,
  );
}

interface ScheduleListProps {
  slots: Schedule[];
  showSection?: boolean;
  /** The student's own section — classes from other sections (irregular) get a badge. */
  homeSectionName?: string | null;
  actions?: (slot: Schedule) => ReactNode;
}

export function ScheduleList({ slots, showSection = false, homeSectionName, actions }: ScheduleListProps) {
  return (
    <div className="space-y-6">
      {groupByDay(slots).map((group) => (
        <section key={group.day} aria-labelledby={`day-${group.day}`}>
          <h3 id={`day-${group.day}`} className="mb-2 text-sm font-semibold tracking-wide text-ink-muted">
            {DAY_LABELS[group.day]}
          </h3>
          <ul className="space-y-2">
            {group.slots.map((slot) => (
              <li key={slot.id} className="flex gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm">
                <div className="w-20 shrink-0 border-r border-border pr-3 text-sm">
                  <p className="font-display font-semibold text-primary-900 tabular-nums">{formatTime(slot.startTime)}</p>
                  <p className="text-xs text-ink-muted tabular-nums">{formatTime(slot.endTime)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">
                    <span className="text-primary-700">{slot.subject.code}</span> · {slot.subject.name}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                    <span className="inline-flex items-center gap-1">
                      <UserRound className="size-3.5" aria-hidden="true" />
                      {slot.instructor.fullName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {slot.mode === "ONLINE" ? <Wifi className="size-3.5" aria-hidden="true" /> : <DoorOpen className="size-3.5" aria-hidden="true" />}
                      {classLocation(slot)}
                    </span>
                    {showSection && <span>{slot.section.name}</span>}
                    {homeSectionName !== undefined && slot.section.name !== homeSectionName && (
                      <span className="rounded-full bg-gold-50 px-2 font-medium text-gold-700">with {slot.section.name}</span>
                    )}
                  </div>
                </div>
                {actions && <div className="shrink-0 self-center">{actions(slot)}</div>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

const GRID_DAYS: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/** Timetable grid. Each class block is positioned by its start/end time. */
export function WeeklySchedule({ slots, onSelect }: { slots: Schedule[]; onSelect?: (slot: Schedule) => void }) {
  const days = slots.some((slot) => slot.dayOfWeek === "SUNDAY") ? [...GRID_DAYS, "SUNDAY" as DayOfWeek] : GRID_DAYS;
  const start = Math.min(7 * 60, ...slots.map((slot) => toMinutes(slot.startTime)));
  const end = Math.max(17 * 60, ...slots.map((slot) => toMinutes(slot.endTime)));
  const firstHour = Math.floor(start / 60);
  const hours = Array.from({ length: Math.ceil(end / 60) - firstHour }, (_, index) => firstHour + index);
  const PX_PER_MIN = 1.1;

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <div className="grid min-w-[760px]" style={{ gridTemplateColumns: `4rem repeat(${days.length}, minmax(0, 1fr))` }}>
        <div className="border-b border-border bg-surface-muted" />
        {days.map((day) => (
          <div key={day} className="border-b border-l border-border bg-surface-muted px-2 py-2 text-center text-xs font-semibold text-ink-soft">
            {DAY_LABELS[day].slice(0, 3)}
          </div>
        ))}

        {/* Hour labels */}
        <div className="relative" style={{ height: (hours.length * 60) * PX_PER_MIN }}>
          {hours.map((hour, index) => (
            <span key={hour} className="absolute right-2 -translate-y-1/2 text-[0.7rem] text-ink-muted" style={{ top: index * 60 * PX_PER_MIN }}>
              {formatTime(`${String(hour).padStart(2, "0")}:00`).replace(":00", "")}
            </span>
          ))}
        </div>

        {days.map((day) => (
          <div key={day} className="relative border-l border-border" style={{ height: (hours.length * 60) * PX_PER_MIN }}>
            {hours.map((hour, index) => (
              <div key={hour} aria-hidden="true" className="absolute inset-x-0 border-t border-border/70" style={{ top: index * 60 * PX_PER_MIN }} />
            ))}
            {slots
              .filter((slot) => slot.dayOfWeek === day)
              .map((slot) => {
                const top = (toMinutes(slot.startTime) - firstHour * 60) * PX_PER_MIN;
                const height = (toMinutes(slot.endTime) - toMinutes(slot.startTime)) * PX_PER_MIN;
                const Tag = onSelect ? "button" : "div";
                return (
                  <Tag
                    key={slot.id}
                    type={onSelect ? "button" : undefined}
                    onClick={onSelect ? () => onSelect(slot) : undefined}
                    className="absolute inset-x-1 overflow-hidden rounded-md border-l-4 border-gold-400 bg-primary-50 px-2 py-1 text-left text-xs shadow-sm hover:bg-primary-100"
                    style={{ top, height }}
                    aria-label={`${slot.subject.code} ${slot.subject.name}, ${DAY_LABELS[day]} ${formatTimeRange(slot.startTime, slot.endTime)}, ${slot.mode === "ONLINE" ? "online" : `room ${classLocation(slot)}`}`}
                  >
                    <p className="font-semibold text-primary-900">{slot.subject.code}</p>
                    <p className="flex items-center gap-1 text-ink-muted">
                      <Clock className="size-3" aria-hidden="true" />
                      {formatTime(slot.startTime)}
                    </p>
                    <p className="truncate text-ink-muted">{classLocation(slot)}</p>
                  </Tag>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
