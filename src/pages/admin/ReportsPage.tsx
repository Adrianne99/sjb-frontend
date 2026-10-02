// Administrative reports. Each can be printed (sidebars and buttons are hidden on paper).
import { Printer } from "lucide-react";
import { Link } from "react-router";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { StatCard } from "@/components/card/StatCard";
import { BarChart } from "@/components/charts/BarChart";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTerms } from "@/hooks/useLookups";
import { useQueryState } from "@/hooks/useQueryState";
import { reportService } from "@/services/admin.service";
import type { EnrollmentStatus } from "@/types";
import { formatDate, formatMoney, formatYearLevel, todayISO } from "@/utils/format";
import { ENROLLMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/utils/labels";
import { Banknote, Ban, Receipt, Users, Wallet } from "lucide-react";

type TabId = "enrollment" | "collections" | "outstanding";
const STATUSES = Object.keys(ENROLLMENT_STATUS_LABELS) as EnrollmentStatus[];

function firstDayOfMonth() {
  return `${todayISO().slice(0, 7)}-01`;
}

export default function ReportsPage() {
  useDocumentTitle("Reports");
  const { terms, currentTerm } = useTerms();
  const [query, setQuery] = useQueryState({ tab: "enrollment", semesterId: "", dateFrom: "", dateTo: "", page: "1" });
  const tab = query.tab as TabId;
  const termOptions = terms.map((term) => ({ value: String(term.id), label: term.label }));

  return (
    <>
      <PageHeader
        title="Reports"
        description="Live figures from the school database."
        actions={
          <Button variant="secondary" onClick={() => window.print()} leftIcon={<Printer className="size-4" aria-hidden="true" />}>
            Print report
          </Button>
        }
      />
      <div className="no-print">
        <Tabs<TabId>
          label="Reports"
          value={tab}
          onChange={(id) => setQuery("tab", id === "enrollment" ? "" : id)}
          tabs={[
            { id: "enrollment", label: "Enrollment summary" },
            { id: "collections", label: "Collections" },
            { id: "outstanding", label: "Outstanding balances" },
          ]}
        />
      </div>

      {tab === "enrollment" && (
        <EnrollmentReport semesterId={query.semesterId || String(currentTerm?.id ?? "")} termOptions={termOptions} onTermChange={(id) => setQuery("semesterId", id)} />
      )}
      {tab === "collections" && (
        <CollectionsReport dateFrom={query.dateFrom || firstDayOfMonth()} dateTo={query.dateTo || todayISO()} onChange={(field, value) => setQuery(field, value)} />
      )}
      {tab === "outstanding" && (
        <OutstandingReport semesterId={query.semesterId} page={Number(query.page)} termOptions={termOptions} onTermChange={(id) => setQuery("semesterId", id)} onPage={(page) => setQuery("page", String(page))} />
      )}
    </>
  );
}

function EnrollmentReport({ semesterId, termOptions, onTermChange }: { semesterId: string; termOptions: Array<{ value: string; label: string }>; onTermChange: (id: string) => void }) {
  const { data, loading, error, reload } = useApi(() => reportService.enrollmentSummary(semesterId ? Number(semesterId) : undefined), [semesterId]);

  return (
    <Card>
      <CardHeader title={`Enrollment summary${data?.term ? ` — ${data.term.label}` : ""}`} description="Number of students per program and year level, by enrollment status." />
      <div className="border-b border-border p-4 no-print">
        <Select label="Term" className="max-w-xs" value={semesterId} onChange={(event) => onTermChange(event.target.value)} options={termOptions} />
      </div>
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <LoadingState label="Loading report..." />
      ) : (
        <DataTable
          caption="Enrollment summary"
          rows={data.rows}
          getRowKey={(row) => `${row.programCode}-${row.yearLevel}`}
          empty={{ title: "No enrollment records for this term." }}
          columns={[
            { header: "Program", primary: true, cell: (row) => <span className="font-medium">{row.programCode}</span> },
            { header: "Year level", cell: (row) => formatYearLevel(row.yearLevel) },
            ...STATUSES.map((status) => ({ header: ENROLLMENT_STATUS_LABELS[status], align: "center" as const, cell: (row: (typeof data.rows)[number]) => row.counts[status] ?? 0 })),
            { header: "Total", align: "center", cell: (row) => <strong>{row.total}</strong> },
          ]}
        />
      )}
      {data && data.rows.length > 0 && (
        <p className="border-t border-border px-5 py-3 text-sm text-ink-soft">
          Totals: {STATUSES.map((status) => `${ENROLLMENT_STATUS_LABELS[status]} ${data.totals[status] ?? 0}`).join(" · ")}
        </p>
      )}
    </Card>
  );
}

function CollectionsReport({ dateFrom, dateTo, onChange }: { dateFrom: string; dateTo: string; onChange: (field: "dateFrom" | "dateTo", value: string) => void }) {
  const { data, loading, error, reload } = useApi(() => reportService.collections(dateFrom, dateTo), [dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,14rem))] no-print">
          <TextInput label="From" type="date" value={dateFrom} onChange={(event) => onChange("dateFrom", event.target.value)} />
          <TextInput label="To" type="date" value={dateTo} onChange={(event) => onChange("dateTo", event.target.value)} />
        </CardBody>
        <p className="hidden px-5 pb-4 text-sm print:block">
          Period: {formatDate(dateFrom)} – {formatDate(dateTo)}
        </p>
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <LoadingState label="Loading collections..." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total collected" value={formatMoney(data.total)} icon={Banknote} accent="gold" hint={`${formatDate(dateFrom)} – ${formatDate(dateTo)}`} />
            <StatCard label="Payments recorded" value={data.paymentCount} icon={Receipt} />
            <StatCard label="Voided payments" value={data.voidedCount} icon={Ban} accent="warning" hint={`${formatMoney(data.voidedTotal)} not counted`} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader title="By payment method" />
              <DataTable
                caption="Collections by payment method"
                rows={data.byMethod}
                getRowKey={(row) => row.paymentMethod}
                empty={{ title: "No payments in this period." }}
                columns={[
                  { header: "Method", primary: true, cell: (row) => PAYMENT_METHOD_LABELS[row.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] ?? row.paymentMethod },
                  { header: "Payments", align: "center", cell: (row) => row.count },
                  { header: "Amount", align: "right", cell: (row) => <span className="tabular-nums">{formatMoney(row.total)}</span> },
                ]}
              />
            </Card>
            <Card>
              <CardHeader title="Daily collections" />
              <CardBody>
                {data.byDay.length === 0 ? (
                  <p className="text-sm text-ink-muted">No payments in this period.</p>
                ) : (
                  <BarChart title="Daily collections" valueLabel="Amount" data={data.byDay.slice(-14).map((row) => ({ label: formatDate(row.date).replace(/, \d{4}$/, ""), value: Number(row.total), display: formatMoney(row.total) }))} />
                )}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function OutstandingReport({ semesterId, page, termOptions, onTermChange, onPage }: { semesterId: string; page: number; termOptions: Array<{ value: string; label: string }>; onTermChange: (id: string) => void; onPage: (page: number) => void }) {
  const { data, loading, error, reload } = useApi(() => reportService.outstanding({ semesterId, page, pageSize: 20 }), [semesterId, page]);
  const summary = data?.envelope.summary as { studentCount: number; totalOutstanding: string } | undefined;

  return (
    <div className="space-y-6">
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total outstanding" value={formatMoney(summary.totalOutstanding)} icon={Wallet} accent="gold" />
          <StatCard label="Students with a balance" value={summary.studentCount} icon={Users} />
        </div>
      )}
      <Card>
        <CardHeader title="Outstanding balances" description="Students whose assessed fees exceed their recorded payments (archived students excluded)." />
        <div className="border-b border-border p-4 no-print">
          <Select label="Term" placeholder="All terms" className="max-w-xs" value={semesterId} onChange={(event) => onTermChange(event.target.value)} options={termOptions} />
        </div>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <DataTable
              caption="Outstanding balances"
              loading={loading}
              rows={data?.items ?? []}
              getRowKey={(row) => row.student.id}
              empty={{ title: "No outstanding balances.", description: "Every student is fully paid for the selected period." }}
              columns={[
                { header: "Student ID", cell: (row) => <span className="tabular-nums">{row.student.studentNumber}</span> },
                {
                  header: "Name",
                  primary: true,
                  cell: (row) => (
                    <Link to={`/admin/students/${row.student.id}?tab=payments`} className="font-medium text-primary-800 hover:underline">
                      {row.student.formalName}
                    </Link>
                  ),
                },
                { header: "Program", cell: (row) => row.student.programCode },
                { header: "Assessed", align: "right", cell: (row) => <span className="tabular-nums">{formatMoney(row.totalAssessed)}</span> },
                { header: "Paid", align: "right", cell: (row) => <span className="tabular-nums">{formatMoney(row.totalPaid)}</span> },
                { header: "Balance", align: "right", cell: (row) => <strong className="text-primary-900 tabular-nums">{formatMoney(row.balance)}</strong> },
              ]}
            />
            {data && <Pagination meta={data.meta} onPageChange={onPage} />}
          </>
        )}
      </Card>
    </div>
  );
}
