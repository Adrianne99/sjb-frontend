// Record a payment received at the cashier (this is NOT an online payment).
import { useState, type FormEvent } from "react";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Modal } from "@/components/modal/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useApi } from "@/hooks/useApi";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { paymentService } from "@/services/payment.service";
import { studentService } from "@/services/student.service";
import type { Payment, PaymentMethod, StudentSummary } from "@/types";
import { formatMoney, todayISO } from "@/utils/format";
import { PAYMENT_METHOD_LABELS, toOptions } from "@/utils/labels";
import { StudentPicker } from "./StudentPicker";

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: (payment: Payment) => void;
  initialStudent?: StudentSummary | null;
}

export function RecordPaymentModal(props: Props) {
  return props.open ? <RecordPaymentForm {...props} /> : null;
}

function RecordPaymentForm({ onClose, onSaved, initialStudent }: Props) {
  const toast = useToast();
  const [student, setStudent] = useState<StudentSummary | null>(initialStudent ?? null);
  const [enrollmentId, setEnrollmentId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { errors, setFromError } = useFormErrors();

  // The student's terms with their current balances (calculated by the backend).
  const statement = useApi(() => (student ? studentService.balance(student.id) : Promise.resolve(null)), [student?.id]);
  const terms = statement.data?.terms ?? [];
  const selectedTerm = terms.find((term) => String(term.enrollmentId) === enrollmentId) ?? terms.find((term) => term.isCurrent) ?? terms[0];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!student || !selectedTerm) {
      setError("Select a student with an enrollment record first.");
      return;
    }
    setSaving(true);
    try {
      const response = await paymentService.record({
        enrollmentId: selectedTerm.enrollmentId,
        amount: Number(amount),
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        remarks: remarks || null,
      });
      toast.success("Payment recorded", `${formatMoney(response.data.amount)} · Ref ${response.data.referenceNumber}`);
      onSaved(response.data);
    } catch (saveError) {
      setFromError(saveError);
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Record payment"
      description="Record a payment received by the Accounting Office."
      size="lg"
      dismissible={!saving}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="payment-form" loading={saving} disabled={!selectedTerm}>
            Record payment
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && <Alert tone="danger">{error}</Alert>}
        <StudentPicker
          value={student}
          onChange={(picked) => {
            setStudent(picked);
            setEnrollmentId("");
          }}
        />

        {student && statement.loading && (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Spinner size="sm" /> Loading terms and balances...
          </p>
        )}
        {student && !statement.loading && terms.length === 0 && <Alert tone="warning">This student has no enrollment records yet. Enroll them in a term first.</Alert>}

        {selectedTerm && (
          <>
            <Select
              label="Term"
              required
              value={String(selectedTerm.enrollmentId)}
              onChange={(event) => setEnrollmentId(event.target.value)}
              options={terms.map((term) => ({ value: String(term.enrollmentId), label: `${term.termLabel} — balance ${formatMoney(term.balance)}` }))}
              error={errors.enrollmentId}
            />
            <div className="grid grid-cols-1 gap-3 rounded-lg bg-surface-muted p-4 text-sm sm:grid-cols-3">
              <p>
                <span className="block text-xs text-ink-muted">Assessed</span>
                <span className="font-medium tabular-nums">{formatMoney(selectedTerm.totalAssessed)}</span>
              </p>
              <p>
                <span className="block text-xs text-ink-muted">Paid</span>
                <span className="font-medium tabular-nums">{formatMoney(selectedTerm.totalPaid)}</span>
              </p>
              <p>
                <span className="block text-xs text-ink-muted">Current balance</span>
                <span className="font-display font-semibold text-primary-900 tabular-nums">{formatMoney(selectedTerm.balance)}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextInput label="Amount (₱)" type="number" min="0.01" step="0.01" inputMode="decimal" required value={amount} onChange={(event) => setAmount(event.target.value)} error={errors.amount} />
              <TextInput label="Payment date" type="date" required value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} error={errors.paymentDate} />
              <Select label="Payment method" required value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} options={toOptions(PAYMENT_METHOD_LABELS)} error={errors.paymentMethod} />
              <TextInput
                label="Reference / OR number"
                value={referenceNumber}
                onChange={(event) => setReferenceNumber(event.target.value)}
                hint="Leave blank to generate one automatically."
                maxLength={50}
                error={errors.referenceNumber}
              />
            </div>
            <TextInput label="Remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} maxLength={255} placeholder="e.g. Downpayment" error={errors.remarks} />
          </>
        )}
      </form>
    </Modal>
  );
}
