// Payment records with filters. Recording a payment here does NOT charge the
// student online — it records money received by the Accounting Office.
import { Plus, Receipt } from "lucide-react";
import { useState } from "react";
import { PaymentDetailModal } from "@/components/admin/PaymentDetailModal";
import { RecordPaymentModal } from "@/components/admin/RecordPaymentModal";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card } from "@/components/card/Card";
import { SearchInput } from "@/components/form/SearchInput";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useAcademicYears, useTerms } from "@/hooks/useLookups";
import { useQueryState } from "@/hooks/useQueryState";
import { useSearchBox } from "@/hooks/useSearchBox";
import { paymentService } from "@/services/payment.service";
import type { Payment } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate, formatMoney } from "@/utils/format";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, toOptions } from "@/utils/labels";

export default function PaymentsPage() {
  useDocumentTitle("Payments");
  const { can } = useAuth();
  const { terms } = useTerms();
  const years = useAcademicYears();
  const [filters, setFilter] = useQueryState({ search: "", academicYearId: "", semesterId: "", status: "", paymentMethod: "", dateFrom: "", dateTo: "", page: "1" });
  const [searchText, setSearchText] = useSearchBox(filters.search, (value) => setFilter("search", value));
  const [recording, setRecording] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, loading, error, reload } = useApi(
    () => paymentService.list({ ...filters, pageSize: 20 }),
    [filters.search, filters.academicYearId, filters.semesterId, filters.status, filters.paymentMethod, filters.dateFrom, filters.dateTo, filters.page],
  );
  const summary = data?.envelope.summary as { recordedTotal: string } | undefined;

  return (
    <>
      <PageHeader
        title="Payments"
        description="Payments recorded by the Accounting Office. Payments are never deleted — mistakes are voided with a reason."
        actions={
          can("payments:record") && (
            <Button onClick={() => setRecording(true)} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
              Record payment
            </Button>
          )
        }
      />

      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <SearchInput value={searchText} onChange={setSearchText} label="Search payments" placeholder="Reference no., student ID or name..." className="sm:col-span-2" />
          <Select label="Academic year" hideLabel placeholder="All academic years" value={filters.academicYearId} onChange={(event) => setFilter("academicYearId", event.target.value)} options={(years.data ?? []).map((year) => ({ value: String(year.id), label: year.name }))} />
          <Select label="Term" hideLabel placeholder="All terms" value={filters.semesterId} onChange={(event) => setFilter("semesterId", event.target.value)} options={terms.map((term) => ({ value: String(term.id), label: term.label }))} />
          <Select label="Status" hideLabel placeholder="All statuses" value={filters.status} onChange={(event) => setFilter("status", event.target.value)} options={toOptions(PAYMENT_STATUS_LABELS)} />
          <Select label="Method" hideLabel placeholder="All methods" value={filters.paymentMethod} onChange={(event) => setFilter("paymentMethod", event.target.value)} options={toOptions(PAYMENT_METHOD_LABELS)} />
          <TextInput label="From date" hideLabel type="date" value={filters.dateFrom} onChange={(event) => setFilter("dateFrom", event.target.value)} />
          <TextInput label="To date" hideLabel type="date" value={filters.dateTo} onChange={(event) => setFilter("dateTo", event.target.value)} />
        </div>

        {summary && (
          <p className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-border bg-surface-muted/50 px-5 py-3 text-sm text-ink-muted">
            <span>
              <strong className="text-ink">{data?.meta.total ?? 0}</strong> payment(s) match
            </span>
            <span>
              Total recorded (excluding voided): <strong className="font-display text-primary-900 tabular-nums">{formatMoney(summary.recordedTotal)}</strong>
            </span>
          </p>
        )}

        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <DataTable<Payment>
              caption="Payments"
              loading={loading}
              loadingLabel="Loading payment history..."
              rows={data?.items ?? []}
              getRowKey={(row) => row.id}
              onRowClick={(row) => setSelectedId(row.id)}
              rowClassName={(row) => (row.status === "VOIDED" ? "opacity-75" : undefined)}
              empty={{ title: "No payment records found.", description: "Try other filters or record a new payment." }}
              columns={[
                { header: "Date", cell: (row) => <span className="whitespace-nowrap">{formatDate(row.paymentDate)}</span> },
                { header: "Reference", cell: (row) => <span className="font-medium tabular-nums">{row.referenceNumber}</span> },
                {
                  header: "Student",
                  primary: true,
                  cell: (row) => (
                    <div>
                      <p className="font-medium">{row.student.formalName}</p>
                      <p className="text-xs text-ink-muted tabular-nums">{row.student.studentNumber}</p>
                    </div>
                  ),
                },
                { header: "Term", cell: (row) => row.termLabel, hideOnMobile: true },
                { header: "Method", cell: (row) => PAYMENT_METHOD_LABELS[row.paymentMethod] },
                { header: "Amount", align: "right", cell: (row) => <span className={cn("font-medium tabular-nums", row.status === "VOIDED" && "line-through")}>{formatMoney(row.amount)}</span> },
                { header: "Status", cell: (row) => <StatusBadge kind="payment" value={row.status} /> },
                { header: "Recorded by", cell: (row) => row.recordedBy, hideOnMobile: true },
              ]}
            />
            {data && <Pagination meta={data.meta} onPageChange={(page) => setFilter("page", String(page))} />}
          </>
        )}
      </Card>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
        <Receipt className="size-3.5" aria-hidden="true" /> Click a payment to view details or void it.
      </p>

      <RecordPaymentModal
        open={recording}
        onClose={() => setRecording(false)}
        onSaved={(payment) => {
          setRecording(false);
          reload();
          setSelectedId(payment.id);
        }}
      />
      <PaymentDetailModal paymentId={selectedId} onClose={() => setSelectedId(null)} onChanged={reload} />
    </>
  );
}
