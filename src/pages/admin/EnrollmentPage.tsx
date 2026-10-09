// Enrollment records per term, with filters and the "Enroll a student" dialog.
import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { EnrollmentFormModal } from "@/components/admin/EnrollmentFormModal";
import { EnrollmentManageModal } from "@/components/admin/EnrollmentManageModal";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card } from "@/components/card/Card";
import { SearchInput } from "@/components/form/SearchInput";
import { Select } from "@/components/form/Select";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePrograms, useSections, useTerms } from "@/hooks/useLookups";
import { useQueryState } from "@/hooks/useQueryState";
import { useSearchBox } from "@/hooks/useSearchBox";
import { enrollmentService } from "@/services/enrollment.service";
import type { Enrollment } from "@/types";
import { formatDate, formatMoney, formatYearLevel } from "@/utils/format";
import { allYearLevelOptions, ENROLLMENT_STATUS_LABELS, toOptions } from "@/utils/labels";
import { FilterBar } from "@/components/table/FilterBar";
import { clearedFilters, countActiveFilters } from "@/utils/filters";

/** Filters in the Filters panel (the search box is separate). */
const FILTER_KEYS = ["semesterId", "status", "programId", "yearLevel", "sectionId"] as const;

export default function EnrollmentPage() {
  useDocumentTitle("Enrollment");
  const { can } = useAuth();
  const { terms, currentTerm } = useTerms();
  const programs = usePrograms();
  const [filters, setFilter, setFilters] = useQueryState({ semesterId: "", search: "", programId: "", yearLevel: "", sectionId: "", status: "", page: "1" });
  const [searchText, setSearchText] = useSearchBox(filters.search, (value) => setFilter("search", value));
  const [creating, setCreating] = useState(false);
  const [managingId, setManagingId] = useState<number | null>(null);

  // Default to the current term; "all" shows every term.
  const semesterId = filters.semesterId === "all" ? "" : filters.semesterId || String(currentTerm?.id ?? "");
  const term = terms.find((item) => String(item.id) === semesterId);
  const sections = useSections(term?.academicYearId);

  const { data, loading, error, reload } = useApi(
    () => (currentTerm || filters.semesterId ? enrollmentService.list({ ...filters, semesterId, pageSize: 20 }) : Promise.resolve(null)),
    [semesterId, filters.search, filters.programId, filters.yearLevel, filters.sectionId, filters.status, filters.page, Boolean(currentTerm)],
  );

  return (
    <>
      <PageHeader
        title="Enrollment"
        description="Enrollment records by term. A student can have only one enrollment record per term."
        actions={
          can("enrollments:write") && (
            <Button onClick={() => setCreating(true)} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
              Enroll a student
            </Button>
          )
        }
      />

      <Card>
        <FilterBar
          search={
            <SearchInput value={searchText} onChange={setSearchText} label="Search enrollments" placeholder="Student ID or name..." />
          }
          activeCount={countActiveFilters(filters, FILTER_KEYS)}
          onClear={() => setFilters(clearedFilters(FILTER_KEYS))}
        >
          <Select
            label="Term"
            hideLabel
            value={filters.semesterId === "all" ? "all" : semesterId}
            onChange={(event) => {
              setFilter("semesterId", event.target.value);
            }}
            options={[...terms.map((item) => ({ value: String(item.id), label: item.label })), { value: "all", label: "All terms" }]}

          />
          <Select label="Status" hideLabel placeholder="All statuses" value={filters.status} onChange={(event) => setFilter("status", event.target.value)} options={toOptions(ENROLLMENT_STATUS_LABELS)} />
          <Select label="Program" hideLabel placeholder="All programs" value={filters.programId} onChange={(event) => setFilter("programId", event.target.value)} options={(programs.data ?? []).map((program) => ({ value: String(program.id), label: program.code }))} />
          <Select label="Year level" hideLabel placeholder="All year levels" value={filters.yearLevel} onChange={(event) => setFilter("yearLevel", event.target.value)} options={allYearLevelOptions(programs.data)} />
          <Select label="Section" hideLabel placeholder="All sections" value={filters.sectionId} onChange={(event) => setFilter("sectionId", event.target.value)} options={(sections.data ?? []).map((section) => ({ value: String(section.id), label: section.name }))} />
        </FilterBar>

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <DataTable<Enrollment>
              caption="Enrollment records"
              loading={loading}
              loadingLabel="Loading enrollment records..."
              rows={data?.items ?? []}
              getRowKey={(row) => row.id}
              onRowClick={(row) => setManagingId(row.id)}
              empty={{ title: "No enrollment records found.", description: "Try another term or clear the filters." }}
              columns={[
                {
                  header: "Student",
                  primary: true,
                  cell: (row) => (
                    <div>
                      <Link to={`/admin/students/${row.studentId}`} onClick={(event) => event.stopPropagation()} className="font-medium text-primary-800 hover:underline">
                        {row.student?.formalName}
                      </Link>
                      <p className="text-xs text-ink-muted tabular-nums">{row.student?.studentNumber}</p>
                    </div>
                  ),
                },
                { header: "Term", cell: (row) => row.termLabel, hideOnMobile: Boolean(semesterId) },
                { header: "Program / Year", cell: (row) => `${row.programCode} · ${formatYearLevel(row.yearLevel)}` },
                { header: "Section", cell: (row) => row.sectionName ?? <span className="text-ink-muted">Not assigned</span> },
                { header: "Enrolled on", cell: (row) => formatDate(row.enrollmentDate) },
                { header: "Status", cell: (row) => <StatusBadge kind="enrollment" value={row.status} /> },
                { header: "Balance", align: "right", cell: (row) => <span className="tabular-nums">{formatMoney(row.balance?.balance)}</span> },
              ]}
            />
            {data && <Pagination meta={data.meta} onPageChange={(page) => setFilter("page", String(page))} />}
          </>
        )}
      </Card>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
        <ClipboardList className="size-3.5" aria-hidden="true" /> Click a row to update the status or section and manage charges.
      </p>

      <EnrollmentFormModal
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={(enrollment) => {
          setCreating(false);
          reload();
          setManagingId(enrollment.id);
        }}
      />
      <EnrollmentManageModal enrollmentId={managingId} onClose={() => setManagingId(null)} onChanged={reload} />
    </>
  );
}
