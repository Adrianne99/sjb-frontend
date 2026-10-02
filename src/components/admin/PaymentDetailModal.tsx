// Payment details with Void (staff) and Correct details (admin).
// Amounts are never edited — a wrong amount is voided and recorded again.
import { Ban, Pencil } from "lucide-react";
import { useState, type FormEvent } from "react";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Textarea } from "@/components/form/Textarea";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { Modal } from "@/components/modal/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { DescriptionList } from "@/components/ui/DescriptionList";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { paymentService } from "@/services/payment.service";
import type { Payment, PaymentMethod } from "@/types";
import { formatDate, formatDateTime, formatMoney } from "@/utils/format";
import { PAYMENT_METHOD_LABELS, toOptions } from "@/utils/labels";

export function PaymentDetailModal({ paymentId, onClose, onChanged }: { paymentId: number | null; onClose: () => void; onChanged: () => void }) {
  return (
    <Modal open={paymentId !== null} onClose={onClose} title="Payment details" size="lg">
      {paymentId !== null && <PaymentDetail paymentId={paymentId} onChanged={onChanged} />}
    </Modal>
  );
}

function PaymentDetail({ paymentId, onChanged }: { paymentId: number; onChanged: () => void }) {
  const { can } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload, setData } = useApi(() => paymentService.get(paymentId), [paymentId]);
  const [voidOpen, setVoidOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [voiding, setVoiding] = useState(false);
  const [editing, setEditing] = useState(false);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Loading payment..." />;

  const update = (payment: Payment) => {
    setData(payment);
    onChanged();
  };

  async function confirmVoid() {
    setVoiding(true);
    try {
      const response = await paymentService.void(paymentId, reason.trim());
      toast.success("Payment voided", "The balance has been updated.");
      setVoidOpen(false);
      update(response.data);
    } catch (voidError) {
      toast.error("Could not void payment", getErrorMessage(voidError));
    } finally {
      setVoiding(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-2xl font-semibold text-primary-900 tabular-nums">{formatMoney(data.amount)}</p>
          <p className="text-sm text-ink-muted">Ref {data.referenceNumber}</p>
        </div>
        <StatusBadge kind="payment" value={data.status} />
      </div>

      {data.status === "VOIDED" && (
        <Alert tone="danger" title="This payment was voided">
          {data.voidReason} — by {data.voidedBy ?? "staff"} on {formatDateTime(data.voidedAt)}. It does not reduce the balance.
        </Alert>
      )}

      {editing ? (
        <EditPaymentForm payment={data} onCancel={() => setEditing(false)} onSaved={(payment) => { update(payment); setEditing(false); }} />
      ) : (
        <DescriptionList
          items={[
            { label: "Student", value: `${data.student.formalName} (${data.student.studentNumber})`, wide: true },
            { label: "Term", value: data.termLabel },
            { label: "Payment date", value: formatDate(data.paymentDate) },
            { label: "Payment method", value: PAYMENT_METHOD_LABELS[data.paymentMethod] },
            { label: "Recorded by", value: data.recordedBy },
            { label: "Recorded on", value: formatDateTime(data.createdAt) },
            { label: "Remarks", value: data.remarks, wide: true },
          ]}
        />
      )}

      {data.termBalance && (
        <p className="rounded-lg bg-surface-muted px-4 py-3 text-sm">
          Term balance after valid payments: <strong className="text-primary-900 tabular-nums">{formatMoney(data.termBalance.balance)}</strong>
        </p>
      )}

      {data.status === "RECORDED" && !editing && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {can("payments:edit") && (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)} leftIcon={<Pencil className="size-4" aria-hidden="true" />}>
              Correct details
            </Button>
          )}
          {can("payments:void") && (
            <Button variant="danger" size="sm" onClick={() => setVoidOpen(true)} leftIcon={<Ban className="size-4" aria-hidden="true" />}>
              Void payment
            </Button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={voidOpen}
        title="Void this payment?"
        tone="danger"
        description={
          <>
            {formatMoney(data.amount)} (ref {data.referenceNumber}) will no longer count toward the student's balance. The record is kept and the action is logged. This
            cannot be undone.
          </>
        }
        confirmLabel="Void payment"
        loading={voiding}
        confirmDisabled={reason.trim().length < 3}
        onCancel={() => setVoidOpen(false)}
        onConfirm={confirmVoid}
      >
        <Textarea label="Reason" required rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Duplicate entry" maxLength={255} />
      </ConfirmDialog>
    </div>
  );
}

function EditPaymentForm({ payment, onCancel, onSaved }: { payment: Payment; onCancel: () => void; onSaved: (payment: Payment) => void }) {
  const toast = useToast();
  const [values, setValues] = useState({
    paymentDate: payment.paymentDate,
    paymentMethod: payment.paymentMethod,
    referenceNumber: payment.referenceNumber,
    remarks: payment.remarks ?? "",
  });
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await paymentService.update(payment.id, { ...values, remarks: values.remarks || null });
      toast.success("Payment details corrected");
      onSaved(response.data);
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-primary-200 bg-primary-50/40 p-4" noValidate>
      <Alert tone="info">The amount cannot be changed. To fix an amount, void this payment and record it again.</Alert>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Payment date" type="date" value={values.paymentDate} onChange={(event) => setValues({ ...values, paymentDate: event.target.value })} error={errors.paymentDate} />
        <Select label="Payment method" value={values.paymentMethod} onChange={(event) => setValues({ ...values, paymentMethod: event.target.value as PaymentMethod })} options={toOptions(PAYMENT_METHOD_LABELS)} />
        <TextInput label="Reference / OR number" value={values.referenceNumber} onChange={(event) => setValues({ ...values, referenceNumber: event.target.value })} error={errors.referenceNumber} />
        <TextInput label="Remarks" value={values.remarks} onChange={(event) => setValues({ ...values, remarks: event.target.value })} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save corrections
        </Button>
      </div>
    </form>
  );
}
