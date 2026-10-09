// Class schedules per term. Conflicts (same instructor, room or section at the
// same time) are blocked by the backend.
import { CalendarDays, LayoutGrid, List, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ScheduleFormModal } from "@/components/admin/ScheduleFormModal";
import { Card } from "@/components/card/Card";
import { Select } from "@/components/form/Select";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { WeeklySchedule } from "@/components/schedule/ScheduleViews";
import { DataTable } from "@/components/table/DataTable";
import { Button, IconButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useInstructors, useRooms, useSections, useTerms } from "@/hooks/useLookups";
import { useQueryState } from "@/hooks/useQueryState";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { scheduleService } from "@/services/schedule.service";
import type { Schedule } from "@/types";
import { cn } from "@/utils/cn";
import { classLocation, formatTimeRange } from "@/utils/format";
import { DAY_LABELS } from "@/utils/labels";
import { FilterBar } from "@/components/table/FilterBar";
import { clearedFilters, countActiveFilters } from "@/utils/filters";

/** Filters in the Filters panel (the search box is separate). */
const FILTER_KEYS = ["sectionId", "instructorId", "roomId"] as const;

export default function SchedulesPage() {
  useDocumentTitle("Schedules");
  const { can } = useAuth();
  const toast = useToast();
  const { terms, currentTerm } = useTerms();
  const instructors = useInstructors();
  const rooms = useRooms();
  const [filters, setFilter, setFilters] = useQueryState({ semesterId: "", sectionId: "", instructorId: "", roomId: "", view: "list" });
  const semesterId = filters.semesterId || String(currentTerm?.id ?? "");
  const term = terms.find((item) => String(item.id) === semesterId);
  const sections = useSections(term?.academicYearId);

  const { data, loading, error, reload } = useApi(
    () => (semesterId ? scheduleService.list({ semesterId, sectionId: filters.sectionId, instructorId: filters.instructorId, roomId: filters.roomId }) : Promise.resolve([])),
    [semesterId, filters.sectionId, filters.instructorId, filters.roomId],
  );

  const [editing, setEditing] = useState<Schedule | null | "new">(null);
  const [deleting, setDeleting] = useState<Schedule | null>(null);
  const [busy, setBusy] = useState(false);
  const canWrite = can("schedules:write");

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await scheduleService.remove(deleting.id);
      toast.success("Schedule removed");
      setDeleting(null);
      reload();
    } catch (deleteError) {
      toast.error("Could not remove schedule", getErrorMessage(deleteError));
    } finally {
      setBusy(false);
    }
  }

  const rows = data ?? [];

  return (
    <>
      <PageHeader
        title="Schedules"
        description="Assign subjects, instructors, rooms and times to each section."
        actions={
          canWrite && (
            <Button onClick={() => setEditing("new")} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
              Add schedule
            </Button>
          )
        }
      />

      <Card>
        <FilterBar
          search={
            <Select label="Term" hideLabel value={semesterId} onChange={(event) => setFilter("semesterId", event.target.value)} options={terms.map((item) => ({ value: String(item.id), label: item.label }))} />
          }
          extra={
            <div role="group" aria-label="View" className="inline-flex h-10 rounded-md border border-border-strong bg-surface p-0.5">
              {(
                [
                  { id: "list", label: "List", icon: List },
                  { id: "week", label: "Weekly", icon: LayoutGrid },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter("view", option.id === "list" ? "" : option.id)}
                  aria-pressed={filters.view === option.id}
                  aria-label={option.label}
                  className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded px-3 text-sm font-medium", filters.view === option.id ? "bg-primary-900 text-white" : "text-ink-soft hover:bg-surface-muted")}
                >
                  <option.icon className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              ))}
            </div>
          }
          activeCount={countActiveFilters(filters, FILTER_KEYS)}
          onClear={() => setFilters(clearedFilters(FILTER_KEYS))}
        >
          <Select label="Section" hideLabel placeholder="All sections" value={filters.sectionId} onChange={(event) => setFilter("sectionId", event.target.value)} options={(sections.data ?? []).map((section) => ({ value: String(section.id), label: section.name }))} />
          <Select label="Instructor" hideLabel placeholder="All instructors" value={filters.instructorId} onChange={(event) => setFilter("instructorId", event.target.value)} options={(instructors.data ?? []).map((instructor) => ({ value: String(instructor.id), label: `${instructor.lastName}, ${instructor.firstName}` }))} />
          <Select label="Room" hideLabel placeholder="All rooms" value={filters.roomId} onChange={(event) => setFilter("roomId", event.target.value)} options={(rooms.data ?? []).map((room) => ({ value: String(room.id), label: room.code }))} />
        </FilterBar>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : filters.view === "week" ? (
          <div className="p-4">
            {loading ? (
              <LoadingState label="Loading schedules..." />
            ) : rows.length === 0 ? (
              <EmptyState icon={CalendarDays} title="No schedule assigned." />
            ) : (
              <>
                {!filters.sectionId && !filters.instructorId && !filters.roomId && <p className="mb-3 text-sm text-ink-muted">Tip: filter by a section, instructor or room for a clearer weekly view.</p>}
                <WeeklySchedule slots={rows} onSelect={canWrite ? (slot) => setEditing(slot) : undefined} />
              </>
            )}
          </div>
        ) : (
          <DataTable<Schedule>
            caption="Class schedules"
            loading={loading}
            loadingLabel="Loading schedules..."
            rows={rows}
            getRowKey={(row) => row.id}
            empty={{ title: "No schedule assigned.", description: canWrite ? "Add the first class for this term." : undefined }}
            columns={[
              { header: "Day", cell: (row) => DAY_LABELS[row.dayOfWeek] },
              { header: "Time", cell: (row) => <span className="whitespace-nowrap tabular-nums">{formatTimeRange(row.startTime, row.endTime)}</span> },
              {
                header: "Subject",
                primary: true,
                cell: (row) => (
                  <span>
                    <span className="font-medium text-primary-800">{row.subject.code}</span> · {row.subject.name}
                  </span>
                ),
              },
              { header: "Section", cell: (row) => row.section.name },
              { header: "Instructor", cell: (row) => row.instructor.fullName },
              { header: "Room", cell: (row) => classLocation(row) },
              ...(canWrite
                ? [
                    {
                      header: "Actions",
                      align: "right" as const,
                      cell: (row: Schedule) => (
                        <div className="flex justify-end gap-1">
                          <IconButton label={`Edit ${row.subject.code} ${DAY_LABELS[row.dayOfWeek]}`} size="sm" onClick={() => setEditing(row)}>
                            <Pencil className="size-4" aria-hidden="true" />
                          </IconButton>
                          <IconButton label={`Remove ${row.subject.code} ${DAY_LABELS[row.dayOfWeek]}`} size="sm" onClick={() => setDeleting(row)}>
                            <Trash2 className="size-4 text-danger-600" aria-hidden="true" />
                          </IconButton>
                        </div>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </Card>

      <ScheduleFormModal
        open={editing !== null}
        schedule={editing === "new" ? null : editing}
        defaultSemesterId={Number(semesterId) || undefined}
        defaultSectionId={filters.sectionId ? Number(filters.sectionId) : undefined}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        tone="danger"
        title="Remove this class meeting?"
        description={deleting ? `${deleting.subject.code} for ${deleting.section.name}, ${DAY_LABELS[deleting.dayOfWeek]} ${formatTimeRange(deleting.startTime, deleting.endTime)}. Existing grades are not affected.` : ""}
        confirmLabel="Remove"
        loading={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
