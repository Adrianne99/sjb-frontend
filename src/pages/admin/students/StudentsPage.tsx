// Student list with server-side search, filters and pagination.
import { ClipboardList, Eye, GraduationCap, KeyRound, Pencil, UserPlus, Users, Wallet } from "lucide-react";
import { Link } from "react-router";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card } from "@/components/card/Card";
import { SearchInput } from "@/components/form/SearchInput";
import { Select } from "@/components/form/Select";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useSearchBox } from "@/hooks/useSearchBox";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePrograms, useSections, useTerms } from "@/hooks/useLookups";
import { useQueryState } from "@/hooks/useQueryState";
import { studentService } from "@/services/student.service";
import type { StudentListItem } from "@/types";
import { cn } from "@/utils/cn";
import { formatMoney, formatYearLevel, isPositiveAmount } from "@/utils/format";
import { allYearLevelOptions, ENROLLMENT_STATUS_LABELS, STUDENT_STATUS_LABELS, toOptions } from "@/utils/labels";
import { FilterBar } from "@/components/table/FilterBar";
import { clearedFilters, countActiveFilters } from "@/utils/filters";

/** Filters in the Filters panel (the search box is separate). */
const FILTER_KEYS = ["programId", "yearLevel", "sectionId", "enrollmentStatus", "status"] as const;

export default function StudentsPage() {
  useDocumentTitle("Students");
  const { can } = useAuth();
  const [filters, setFilter, setFilters] = useQueryState({ search: "", programId: "", yearLevel: "", sectionId: "", enrollmentStatus: "", status: "", page: "1" });

  const [searchText, setSearchText] = useSearchBox(filters.search, (value) => setFilter("search", value));

  const programs = usePrograms();
  const { currentTerm } = useTerms();
  const sections = useSections(currentTerm?.academicYearId);

  const { data, loading, error, reload } = useApi(
    () => studentService.list({ ...filters, pageSize: 20 }),
    [filters.search, filters.programId, filters.yearLevel, filters.sectionId, filters.enrollmentStatus, filters.status, filters.page],
  );

  const termLabel = (data?.envelope.currentTerm as { label: string } | null)?.label;

  return (
    <>
      <PageHeader
        title="Students"
        description={termLabel ? `Year, section and status columns show the current term (${termLabel}).` : "All student records."}
        actions={
          can("students:write") && (
            <ButtonLink to="/admin/students/new" leftIcon={<UserPlus className="size-4" aria-hidden="true" />}>
              New student
            </ButtonLink>
          )
        }
      />

      <Card>
        <FilterBar
          search={
            <SearchInput value={searchText} onChange={setSearchText} label="Search students" placeholder="Student ID or name..." />
          }
          activeCount={countActiveFilters(filters, FILTER_KEYS)}
          onClear={() => setFilters(clearedFilters(FILTER_KEYS))}
        >
          <Select label="Program" hideLabel placeholder="All programs" value={filters.programId} onChange={(event) => setFilter("programId", event.target.value)} options={(programs.data ?? []).map((program) => ({ value: String(program.id), label: program.code }))} />
          <Select label="Year level" hideLabel placeholder="All year levels" value={filters.yearLevel} onChange={(event) => setFilter("yearLevel", event.target.value)} options={allYearLevelOptions(programs.data)} />
          <Select label="Section" hideLabel placeholder="All sections" value={filters.sectionId} onChange={(event) => setFilter("sectionId", event.target.value)} options={(sections.data ?? []).map((section) => ({ value: String(section.id), label: section.name }))} />
          <Select
            label="Enrollment status"
            hideLabel
            placeholder="Any status"
            value={filters.enrollmentStatus}
            onChange={(event) => setFilter("enrollmentStatus", event.target.value)}
            options={toOptions(ENROLLMENT_STATUS_LABELS)}
          />
          <Select
            label="Record status"
            hideLabel
            placeholder="Active records"
            value={filters.status}
            onChange={(event) => setFilter("status", event.target.value)}
            options={toOptions(STUDENT_STATUS_LABELS)}
          />
        </FilterBar>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <DataTable<StudentListItem>
              caption="Students"
              loading={loading}
              loadingLabel="Loading student records..."
              rows={data?.items ?? []}
              getRowKey={(row) => row.id}
              empty={{
                title: "No students found.",
                description: "Try a different search or clear the filters.",
              }}
              columns={[
                { header: "Student ID", cell: (row) => <span className="font-medium tabular-nums">{row.studentNumber}</span> },
                {
                  header: "Name",
                  primary: true,
                  cell: (row) => (
                    <Link to={`/admin/students/${row.id}`} className="font-medium text-primary-800 hover:underline">
                      {row.formalName}
                    </Link>
                  ),
                },
                { header: "Program", cell: (row) => row.programCode },
                { header: "Year", cell: (row) => (row.currentEnrollment ? formatYearLevel(row.currentEnrollment.yearLevel) : "—") },
                { header: "Section", cell: (row) => row.currentEnrollment?.sectionName ?? "—" },
                {
                  header: "Status",
                  cell: (row) =>
                    row.status === "ARCHIVED" ? (
                      <StatusBadge kind="student" value="ARCHIVED" />
                    ) : row.currentEnrollment ? (
                      <StatusBadge kind="enrollment" value={row.currentEnrollment.status} />
                    ) : (
                      <span className="text-xs text-ink-muted">Not enrolled</span>
                    ),
                },
                {
                  header: "Balance",
                  align: "right",
                  cell: (row) => <span className={cn("tabular-nums", isPositiveAmount(row.balance) ? "font-medium text-ink" : "text-ink-muted")}>{formatMoney(row.balance)}</span>,
                },
                {
                  header: "Actions",
                  align: "right",
                  cell: (row) => (
                    <ActionMenu
                      label={`Actions for ${row.fullName}`}
                      items={[
                        { label: "View", icon: Eye, to: `/admin/students/${row.id}` },
                        ...(can("students:write") ? [{ label: "Edit", icon: Pencil, to: `/admin/students/${row.id}/edit` }] : []),
                        { label: "Enrollment", icon: ClipboardList, to: `/admin/students/${row.id}?tab=enrollment` },
                        { label: "Grades", icon: GraduationCap, to: `/admin/students/${row.id}?tab=grades` },
                        { label: "Payments", icon: Wallet, to: `/admin/students/${row.id}?tab=payments` },
                        { label: "Account", icon: KeyRound, to: `/admin/students/${row.id}?tab=account` },
                      ]}
                    />
                  ),
                },
              ]}
            />
            {data && <Pagination meta={data.meta} onPageChange={(page) => setFilter("page", String(page))} />}
          </>
        )}
      </Card>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
        <Users className="size-3.5" aria-hidden="true" />
        Archived students are hidden unless you choose “Archived” in the record status filter.
      </p>
    </>
  );
}
