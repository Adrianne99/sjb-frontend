// Teacher dashboard: today's classes, the weekly schedule, and announcements.
// Everything comes from /api/teaching (only this teacher's own classes).
import { BookOpen, CalendarClock, Megaphone } from "lucide-react";
import { Card, CardHeader } from "@/components/card/Card";
import { AnnouncementCard } from "@/components/landing/AnnouncementCard";
import { DataTable } from "@/components/table/DataTable";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { teachingService } from "@/services/teaching.service";
import type { DayOfWeek, Schedule } from "@/types";
import { classLocation, formatTimeRange } from "@/utils/format";
import { DAY_LABELS } from "@/utils/labels";

/** Today's weekday in the Philippines, e.g. "MONDAY". */
function todayInManila(): DayOfWeek {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Manila" }).format(new Date()).toUpperCase() as DayOfWeek;
}

/** "IT102 · IT 1-A" */
const classLabel = (slot: Schedule) => `${slot.subject.code} · ${slot.section.name}`;

export function TeacherDashboard() {
  const { user } = useAuth();
  const schedule = useApi(() => teachingService.schedule(), []);
  const announcements = useApi(() => teachingService.announcements(), []);
  const today = todayInManila();
  const todaysClasses = (schedule.data?.slots ?? []).filter((slot) => slot.dayOfWeek === today);

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.displayName ?? ""}`}
        description="Your classes this term."
        actions={
          <ButtonLink to="/admin/my-classes" leftIcon={<BookOpen className="size-4" aria-hidden="true" />}>
            Enter grades
          </ButtonLink>
        }
      />

      {schedule.error ? (
        <ErrorState message={schedule.error} onRetry={schedule.reload} />
      ) : schedule.loading || !schedule.data ? (
        <SkeletonCards />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader title={`Today (${DAY_LABELS[today]})`} icon={<CalendarClock className="size-5" aria-hidden="true" />} />
            {todaysClasses.length === 0 ? (
              <EmptyState title="No classes today." />
            ) : (
              <ul className="divide-y divide-border">
                {todaysClasses.map((slot) => (
                  <li key={slot.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">{classLabel(slot)}</p>
                      <p className="text-xs text-ink-muted">
                        {slot.subject.name} · {classLocation(slot)}
                      </p>
                    </div>
                    <p className="text-sm whitespace-nowrap text-ink-soft tabular-nums">{formatTimeRange(slot.startTime, slot.endTime)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title="Weekly schedule" description={`${schedule.data.slots.length} class meeting(s) a week`} />
            <DataTable<Schedule>
              caption="Weekly class schedule"
              rows={schedule.data.slots}
              getRowKey={(slot) => slot.id}
              empty={{ title: "No classes assigned to you this term." }}
              columns={[
                { header: "Day", primary: true, cell: (slot) => DAY_LABELS[slot.dayOfWeek] },
                { header: "Time", cell: (slot) => <span className="tabular-nums">{formatTimeRange(slot.startTime, slot.endTime)}</span> },
                { header: "Class", cell: (slot) => classLabel(slot) },
                { header: "Subject", cell: (slot) => slot.subject.name, hideOnMobile: true },
                { header: "Room", cell: (slot) => classLocation(slot) },
              ]}
            />
          </Card>
        </div>
      )}

      <Card className="mt-6">
        <CardHeader title="Announcements" icon={<Megaphone className="size-5" aria-hidden="true" />} />
        {announcements.error ? (
          <ErrorState message={announcements.error} onRetry={announcements.reload} />
        ) : !announcements.data || announcements.data.length === 0 ? (
          <EmptyState title={announcements.loading ? "Loading announcements..." : "No announcements right now."} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            {announcements.data.map((announcement) => (
              <li key={announcement.id}>
                <AnnouncementCard announcement={announcement} compact />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
