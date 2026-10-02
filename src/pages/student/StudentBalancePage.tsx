// Balance & payments. Every amount here was calculated by the backend.
import { Banknote, CircleCheck, Receipt, Wallet } from "lucide-react";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { PaymentScheduleList } from "@/components/finance/PaymentScheduleList";
import { StatCard } from "@/components/card/StatCard";
import { DataTable } from "@/components/table/DataTable";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalService } from "@/services/portal.service";
import { cn } from "@/utils/cn";
import { formatDate, formatMoney, isPositiveAmount } from "@/utils/format";
import { PAYMENT_METHOD_LABELS } from "@/utils/labels";

export default function StudentBalancePage() {
  useDocumentTitle("Balance & Payments");
  const statement = useApi(() => portalService.balance(), []);
  const payments = useApi(() => portalService.paymentHistory(), []);

  if (statement.error) return <ErrorState message={statement.error} onRetry={statement.reload} />;

  return (
    <>
      <PageHeader title="Balance & Payments" description="Your assessed fees, recorded payments and remaining balance." />

      {statement.loading || !statement.data ? (
        <SkeletonCards count={3} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total assessed" value={formatMoney(statement.data.totalAssessed)} icon={Receipt} />
          <StatCard label="Total payments" value={formatMoney(statement.data.totalPaid)} icon={Banknote} />
          <StatCard
            label="Remaining balance"
            value={formatMoney(statement.data.balance)}
            icon={isPositiveAmount(statement.data.balance) ? Wallet : CircleCheck}
            accent="gold"
            hint={isPositiveAmount(statement.data.balance) ? "Please settle at the Accounting Office." : "Fully paid — thank you!"}
          />
        </div>
      )}

      <Alert tone="info" className="mt-6">
        This page shows payments recorded by the Accounting Office. Online payment is not available in the portal.
      </Alert>

      {/* Per-term breakdown */}
      {statement.data && statement.data.terms.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Assessment by term" description="Charges per term and what has been paid." />
          <ul className="divide-y divide-border">
            {statement.data.terms.map((term) => (
              <li key={term.enrollmentId}>
                <details className="group" open={term.isCurrent}>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-6 gap-y-1 px-5 py-4 hover:bg-surface-muted">
                    <span className="min-w-0 basis-full font-medium text-ink sm:flex-1 sm:basis-auto">
                      {term.termLabel}
                      {term.isCurrent && <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">Current</span>}
                    </span>
                    <span className="text-sm text-ink-muted">
                      Assessed <span className="font-medium text-ink tabular-nums">{formatMoney(term.totalAssessed)}</span>
                    </span>
                    <span className="text-sm text-ink-muted">
                      Paid <span className="font-medium text-ink tabular-nums">{formatMoney(term.totalPaid)}</span>
                    </span>
                    <span className={cn("text-sm font-semibold tabular-nums", isPositiveAmount(term.balance) ? "text-primary-900" : "text-success-700")}>
                      Balance {formatMoney(term.balance)}
                    </span>
                  </summary>
                  <CardBody className="space-y-4 bg-surface-muted/40">
                    {term.assessments.length === 0 ? (
                      // With a payment option (e.g. Senior High voucher) the schedule below explains it.
                      !term.paymentPlan && <p className="text-sm text-ink-muted">No charges assessed yet for this term.</p>
                    ) : (
                      <dl className="divide-y divide-border text-sm">
                        {term.assessments.map((item) => (
                          <div key={item.id} className="flex justify-between gap-4 py-2">
                            <dt className="text-ink-soft">{item.description}</dt>
                            <dd className={cn("font-medium tabular-nums", Number(item.amount) < 0 && "text-success-700")}>{formatMoney(item.amount)}</dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    <PaymentScheduleList plan={term.paymentPlan} planLabel={term.paymentPlanLabel} schedule={term.paymentSchedule} />
                  </CardBody>
                </details>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Payment history */}
      <Card className="mt-6">
        <CardHeader title="Payment history" />
        {payments.error ? (
          <ErrorState message={payments.error} onRetry={payments.reload} />
        ) : payments.data && payments.data.length === 0 ? (
          <EmptyState icon={Receipt} title="No payment records found." />
        ) : (
          <DataTable
            caption="Payment history"
            loading={payments.loading}
            loadingLabel="Loading payment history..."
            rows={payments.data ?? []}
            getRowKey={(row) => row.id}
            empty={{ title: "No payment records found." }}
            rowClassName={(row) => (row.status === "VOIDED" ? "opacity-70" : undefined)}
            columns={[
              { header: "Date", cell: (row) => formatDate(row.paymentDate) },
              { header: "Reference no.", primary: true, cell: (row) => <span className="font-medium tabular-nums">{row.referenceNumber}</span> },
              {
                header: "Amount",
                align: "right",
                cell: (row) => <span className={cn("font-medium tabular-nums", row.status === "VOIDED" && "line-through")}>{formatMoney(row.amount)}</span>,
              },
              { header: "Payment type", cell: (row) => PAYMENT_METHOD_LABELS[row.paymentMethod] },
              { header: "Term", cell: (row) => row.termLabel, hideOnMobile: true },
              { header: "Status", cell: (row) => <StatusBadge kind="payment" value={row.status} /> },
            ]}
          />
        )}
      </Card>
    </>
  );
}
