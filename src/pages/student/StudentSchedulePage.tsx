import { CalendarDays, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/card/Card";
import { ScheduleList, WeeklySchedule } from "@/components/schedule/ScheduleViews";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalService } from "@/services/portal.service";
import { cn } from "@/utils/cn";

export default function StudentSchedulePage() {
  useDocumentTitle("My Schedule");
  const { data, loading, error, reload } = useApi(() => portalService.schedule(), []);
  const [view, setView] = useState<"list" | "week">("list");

  return (
    <>
      <PageHeader
        title="My Schedule"
        description={data?.term ? `${data.term.label}${data.sectionName ? ` · ${data.sectionName}` : ""}` : "Your weekly class schedule."}
        actions={
          data?.slots.length ? (
            <div role="group" aria-label="Schedule view" className="hidden rounded-md border border-border-strong bg-surface p-0.5 sm:inline-flex">
              {(
                [
                  { id: "list", label: "List", icon: List },
                  { id: "week", label: "Weekly", icon: LayoutGrid },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setView(option.id)}
                  aria-pressed={view === option.id}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded px-3 text-sm font-medium",
                    view === option.id ? "bg-primary-900 text-white" : "text-ink-soft hover:bg-surface-muted",
                  )}
                >
                  <option.icon className="size-4" aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>
          ) : null
        }
      />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <LoadingState label="Loading schedule..." />
      ) : data.slots.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="No schedule assigned."
            description="Your classes will appear here once you are enrolled and assigned to a section."
          />
        </Card>
      ) : view === "week" ? (
        <>
          <div className="hidden sm:block">
            <WeeklySchedule slots={data.slots} />
          </div>
          <div className="sm:hidden">
            <ScheduleList slots={data.slots} homeSectionName={data.sectionName} />
          </div>
        </>
      ) : (
        <ScheduleList slots={data.slots} homeSectionName={data.sectionName} />
      )}
    </>
  );
}
