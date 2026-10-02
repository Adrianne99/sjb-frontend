// Read-only audit trail (ADMIN only). Entries cannot be edited or deleted.
import { ScrollText } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/badge/Badge";
import { Card } from "@/components/card/Card";
import { SearchInput } from "@/components/form/SearchInput";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQueryState } from "@/hooks/useQueryState";
import { useSearchBox } from "@/hooks/useSearchBox";
import { auditService } from "@/services/admin.service";
import type { AuditLog } from "@/types";
import { formatDateTime } from "@/utils/format";

// Must match AUDIT_ACTIONS in backend/src/services/audit/audit.service.ts
const ACTIONS = [
  "LOGIN", "LOGIN_FAILED", "LOGOUT", "PASSWORD_CHANGED", "PASSWORD_RESET_REQUESTED", "PASSWORD_RESET",
  "ACCOUNT_CREATED", "ACCOUNT_UPDATED", "APPLICATION_SUBMITTED", "APPLICATION_CONVERTED", "APPLICATION_REJECTED", "ACCOUNT_ACTIVATED", "ACCOUNT_DEACTIVATED", "ROLE_CHANGED",
  "STUDENT_CREATED", "STUDENT_UPDATED", "STUDENT_ARCHIVED", "STUDENT_RESTORED", "PROFILE_UPDATED",
  "ENROLLMENT_CREATED", "ENROLLMENT_UPDATED", "ENROLLMENT_SUBJECT_ADDED", "ENROLLMENT_SUBJECT_REMOVED", "REQUIREMENT_UPDATED",
  "FEES_APPLIED", "ASSESSMENT_CREATED", "ASSESSMENT_UPDATED",
  "GRADE_CREATED", "GRADE_UPDATED", "GRADE_PUBLISHED",
  "SCHEDULE_CREATED", "SCHEDULE_UPDATED", "SCHEDULE_DELETED",
  "PAYMENT_RECORDED", "PAYMENT_UPDATED", "PAYMENT_VOIDED",
  "ANNOUNCEMENT_CREATED", "ANNOUNCEMENT_UPDATED", "ACADEMIC_RECORD_CREATED", "ACADEMIC_RECORD_UPDATED", "SETTINGS_UPDATED",
];

const ENTITY_TYPES = ["user", "student", "enrollment", "tuition_assessment", "grade", "grade_sheet", "class_schedule", "payment", "announcement", "system_setting", "semester", "fee_schedule", "requirement_type", "application"];

function actionTone(action: string): BadgeTone {
  if (/FAILED|VOIDED|DEACTIVATED|ARCHIVED|DELETED/.test(action)) return "danger";
  if (/ROLE|PASSWORD|PUBLISHED/.test(action)) return "gold";
  if (/LOGIN|LOGOUT/.test(action)) return "neutral";
  return "info";
}

const label = (value: string) => value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (char) => char.toUpperCase());

export default function AuditLogsPage() {
  useDocumentTitle("Audit Logs");
  const [filters, setFilter] = useQueryState({ search: "", action: "", entityType: "", dateFrom: "", dateTo: "", page: "1" });
  const [searchText, setSearchText] = useSearchBox(filters.search, (value) => setFilter("search", value));
  const { data, loading, error, reload } = useApi(
    () => auditService.list({ ...filters, pageSize: 25 }),
    [filters.search, filters.action, filters.entityType, filters.dateFrom, filters.dateTo, filters.page],
  );

  return (
    <>
      <PageHeader title="Audit Logs" description="A permanent record of logins and important changes to grades, payments, students, enrollment and accounts." />
      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-6">
          <SearchInput value={searchText} onChange={setSearchText} label="Search logs" placeholder="Description or username..." className="sm:col-span-2" />
          <Select label="Action" hideLabel placeholder="All actions" value={filters.action} onChange={(event) => setFilter("action", event.target.value)} options={ACTIONS.map((action) => ({ value: action, label: label(action) }))} />
          <Select label="Record type" hideLabel placeholder="All record types" value={filters.entityType} onChange={(event) => setFilter("entityType", event.target.value)} options={ENTITY_TYPES.map((type) => ({ value: type, label: label(type) }))} />
          <TextInput label="From date" hideLabel type="date" value={filters.dateFrom} onChange={(event) => setFilter("dateFrom", event.target.value)} />
          <TextInput label="To date" hideLabel type="date" value={filters.dateTo} onChange={(event) => setFilter("dateTo", event.target.value)} />
        </div>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <DataTable<AuditLog>
              caption="Audit logs"
              loading={loading}
              loadingLabel="Loading audit logs..."
              rows={data?.items ?? []}
              getRowKey={(row) => row.id}
              empty={{ title: "No activity recorded for these filters." }}
              columns={[
                { header: "Time", cell: (row) => <time dateTime={row.createdAt} className="whitespace-nowrap text-ink-soft">{formatDateTime(row.createdAt)}</time> },
                { header: "User", cell: (row) => (row.user ? <span className="font-medium">{row.user.username}</span> : <span className="text-ink-muted">System / visitor</span>) },
                { header: "Action", cell: (row) => <Badge tone={actionTone(row.action)}>{label(row.action)}</Badge> },
                {
                  header: "Description",
                  primary: true,
                  cell: (row) => (
                    <div className="max-w-xl">
                      <p>{row.description}</p>
                      {row.metadata !== null && row.metadata !== undefined && (
                        <details className="mt-1">
                          <summary className="cursor-pointer text-xs text-primary-700">Details</summary>
                          <pre className="mt-1 max-h-48 overflow-auto rounded bg-surface-muted p-2 text-xs whitespace-pre-wrap">{JSON.stringify(row.metadata, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  ),
                },
                { header: "Record", cell: (row) => <span className="text-xs text-ink-muted">{label(row.entityType)}{row.entityId ? ` #${row.entityId}` : ""}</span>, hideOnMobile: true },
                { header: "IP address", cell: (row) => <span className="font-mono text-xs text-ink-muted">{row.ipAddress ?? "—"}</span>, hideOnMobile: true },
              ]}
            />
            {data && <Pagination meta={data.meta} onPageChange={(page) => setFilter("page", String(page))} />}
          </>
        )}
      </Card>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
        <ScrollText className="size-3.5" aria-hidden="true" /> Audit entries are append-only. No one can edit or delete them through the system.
      </p>
    </>
  );
}
