// Admission requirements across all students: who is complete and who is still
// missing Form 137, Diploma, Report Card (Form 138) or Good Moral.
import { CircleCheck, Clock, FileText } from "lucide-react";
import { Link } from "react-router";
import { Card } from "@/components/card/Card";
import { SearchInput } from "@/components/form/SearchInput";
import { Select } from "@/components/form/Select";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePrograms } from "@/hooks/useLookups";
import { useQueryState } from "@/hooks/useQueryState";
import { useSearchBox } from "@/hooks/useSearchBox";
import { requirementService } from "@/services/requirement.service";
import type { ComplianceRow, RequirementStatus, RequirementType } from "@/types";
import { cn } from "@/utils/cn";
import { REQUIREMENT_STATUS_LABELS, toOptions } from "@/utils/labels";

/** Small icon + word, so status is never shown by color alone. */
function StatusCell({ status }: { status: RequirementStatus }) {
  const style = {
    VERIFIED: { icon: CircleCheck, className: "text-success-700" },
    SUBMITTED: { icon: FileText, className: "text-primary-700" },
    PENDING: { icon: Clock, className: "text-warning-700" },
  }[status];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap", style.className)}>
      <style.icon className="size-4" aria-hidden="true" />
      {REQUIREMENT_STATUS_LABELS[status]}
    </span>
  );
}

export default function RequirementsPage() {
  useDocumentTitle("Requirements");
  const programs = usePrograms();
  const [filters, setFilter] = useQueryState({ search: "", programId: "", completion: "", requirementTypeId: "", status: "", page: "1" });
  const [searchText, setSearchText] = useSearchBox(filters.search, (value) => setFilter("search", value));

  const { data, loading, error, reload } = useApi(
    () => requirementService.compliance({ ...filters, status: filters.requirementTypeId ? filters.status : "", pageSize: 20 }),
    [filters.search, filters.programId, filters.completion, filters.requirementTypeId, filters.status, filters.page],
  );
  const types = (data?.envelope.types as RequirementType[] | undefined) ?? [];

  // Short column headers: "Form 137 (Permanent Record)" -> "Form 137".
  const shortName = (type: RequirementType) => type.name.replace(/\s*\(.*\)\s*$/, "").replace("Certificate of ", "");

  const columns: Column<ComplianceRow>[] = [
    {
      header: "Student",
      primary: true,
      cell: (row) => (
        <div>
          <Link to={`/admin/students/${row.student.id}?tab=requirements`} className="font-medium text-primary-800 hover:underline">
            {row.student.formalName}
          </Link>
          <p className="text-xs text-ink-muted tabular-nums">
            {row.student.studentNumber} · {row.student.programCode}
          </p>
        </div>
      ),
    },
    ...types.map((type) => ({ header: shortName(type), cell: (row: ComplianceRow) => <StatusCell status={row.statuses[type.id] ?? "PENDING"} /> })),
    {
      header: "Progress",
      align: "right",
      cell: (row) => (
        <span className={cn("font-medium tabular-nums", row.complete ? "text-success-700" : "text-ink")}>
          {row.verified}/{row.total} verified
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Requirements" description="Admission documents submitted by each student. Open a student to update their checklist." />
      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-5">
          <SearchInput value={searchText} onChange={setSearchText} label="Search students" placeholder="Student ID or name..." className="lg:col-span-2" />
          <Select label="Program" hideLabel placeholder="All programs" value={filters.programId} onChange={(event) => setFilter("programId", event.target.value)} options={(programs.data ?? []).map((program) => ({ value: String(program.id), label: program.name }))} />
          <Select
            label="Completion"
            hideLabel
            placeholder="Complete & incomplete"
            value={filters.completion}
            onChange={(event) => setFilter("completion", event.target.value)}
            options={[
              { value: "incomplete", label: "Incomplete only" },
              { value: "complete", label: "Complete only" },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            <Select label="Document" hideLabel placeholder="Any document" value={filters.requirementTypeId} onChange={(event) => setFilter("requirementTypeId", event.target.value)} options={types.map((type) => ({ value: String(type.id), label: shortName(type) }))} />
            <Select label="Document status" hideLabel placeholder="Any status" value={filters.status} disabled={!filters.requirementTypeId} onChange={(event) => setFilter("status", event.target.value)} options={toOptions(REQUIREMENT_STATUS_LABELS)} />
          </div>
        </div>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <DataTable<ComplianceRow>
              caption="Admission requirements by student"
              loading={loading}
              loadingLabel="Loading requirements..."
              rows={data?.items ?? []}
              getRowKey={(row) => row.student.id}
              empty={{ title: "No students match these filters." }}
              columns={columns}
            />
            {data && <Pagination meta={data.meta} onPageChange={(page) => setFilter("page", String(page))} />}
          </>
        )}
      </Card>
    </>
  );
}
