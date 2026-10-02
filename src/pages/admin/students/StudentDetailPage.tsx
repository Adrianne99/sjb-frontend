// One student's full record: profile, enrollment history, grades, payments and
// portal account — all from the same central records.
import { Archive, ClipboardList, FileText, KeyRound, Pencil, Plus, RotateCcw, ShieldCheck, ShieldOff, UserPlus, Wallet } from "lucide-react";
import { useState } from "react";
import { useParams } from "react-router";
import { CredentialsModal } from "@/components/admin/CredentialsModal";
import { EnrollmentFormModal } from "@/components/admin/EnrollmentFormModal";
import { EnrollmentManageModal } from "@/components/admin/EnrollmentManageModal";
import { PaymentDetailModal } from "@/components/admin/PaymentDetailModal";
import { RecordPaymentModal } from "@/components/admin/RecordPaymentModal";
import { RequirementsChecklist } from "@/components/admin/RequirementsChecklist";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { StatCard } from "@/components/card/StatCard";
import { Checkbox } from "@/components/form/Checkbox";
import { TextInput } from "@/components/form/TextInput";
import { AcademicHistoryView } from "@/components/grades/AcademicHistoryView";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { DataTable } from "@/components/table/DataTable";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DescriptionList } from "@/components/ui/DescriptionList";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { Tabs } from "@/components/ui/Tabs";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQueryState } from "@/hooks/useQueryState";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { studentService } from "@/services/student.service";
import type { IssuedCredentials, StudentDetail } from "@/types";
import { formatDate, formatDateTime, formatMoney, formatYearLevel } from "@/utils/format";
import { PAYMENT_METHOD_LABELS } from "@/utils/labels";

type TabId = "overview" | "requirements" | "enrollment" | "grades" | "payments" | "account";

export default function StudentDetailPage() {
  const studentId = Number(useParams().id);
  const { can } = useAuth();
  const toast = useToast();
  const [query, setQuery] = useQueryState({ tab: "overview" });
  const tab = query.tab as TabId;
  const { data: student, loading, error, reload, setData } = useApi(() => studentService.get(studentId), [studentId]);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [busy, setBusy] = useState(false);
  useDocumentTitle(student?.fullName ?? "Student");

  if (error) return <ErrorState message={error} onRetry={reload} />;
  // Only on the first load (or another student). A refresh after an action keeps
  // the page on screen, so popups like the new temporary password stay open.
  if (!student || (loading && student.id !== studentId)) return <LoadingState label="Loading student record..." />;

  const archived = student.status === "ARCHIVED";

  async function toggleArchive() {
    setBusy(true);
    try {
      const response = archived ? await studentService.restore(studentId) : await studentService.archive(studentId);
      setData(response.data);
      toast.success(archived ? "Student restored" : "Student archived", archived ? undefined : "Their portal access has been disabled.");
      setConfirmArchive(false);
    } catch (archiveError) {
      toast.error("Action failed", getErrorMessage(archiveError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title={student.fullName}
        breadcrumbs={[{ label: "Students", to: "/admin/students" }, { label: student.studentNumber }]}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="tabular-nums">{student.studentNumber}</span>·<span>{student.programName}</span>
            <StatusBadge kind="student" value={student.status} />
            {student.currentEnrollment && <StatusBadge kind="enrollment" value={student.currentEnrollment.status} />}
          </span>
        }
        actions={
          <>
            {can("students:write") && !archived && (
              <ButtonLink to={`/admin/students/${student.id}/edit`} variant="secondary" leftIcon={<Pencil className="size-4" aria-hidden="true" />}>
                Edit
              </ButtonLink>
            )}
            {can("students:archive") && (
              <Button
                variant={archived ? "secondary" : "ghost"}
                onClick={() => setConfirmArchive(true)}
                leftIcon={archived ? <RotateCcw className="size-4" aria-hidden="true" /> : <Archive className="size-4" aria-hidden="true" />}
              >
                {archived ? "Restore" : "Archive"}
              </Button>
            )}
          </>
        }
      />

      {archived && (
        <Alert tone="warning" className="mb-5">
          This student was archived on {formatDateTime(student.archivedAt)}. The record is read-only and portal access is disabled.
        </Alert>
      )}

      <Tabs<TabId>
        label="Student record sections"
        value={tab}
        onChange={(id) => setQuery("tab", id === "overview" ? "" : id)}
        tabs={[
          { id: "overview", label: "Overview" },
          ...(can("requirements:read") ? [{ id: "requirements" as const, label: "Requirements" }] : []),
          { id: "enrollment", label: "Enrollment", count: student.enrollments.length },
          { id: "grades", label: "Grades" },
          { id: "payments", label: "Payments" },
          { id: "account", label: "Account" },
        ]}
      />

      <div role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "overview" && <OverviewTab student={student} />}
        {tab === "requirements" && <RequirementsChecklist studentId={student.id} readOnly={archived} />}
        {tab === "enrollment" && <EnrollmentTab student={student} onChanged={reload} />}
        {tab === "grades" && <GradesTab studentId={student.id} />}
        {tab === "payments" && <PaymentsTab student={student} onChanged={reload} />}
        {tab === "account" && <AccountTab student={student} onChanged={reload} />}
      </div>

      <ConfirmDialog
        open={confirmArchive}
        title={archived ? "Restore this student?" : "Archive this student?"}
        tone={archived ? "primary" : "danger"}
        description={
          archived
            ? "The record becomes active again and their portal account is re-enabled."
            : "The record is kept (nothing is deleted), but it is hidden from the active list, cannot be enrolled, and portal access is disabled immediately."
        }
        confirmLabel={archived ? "Restore" : "Archive"}
        loading={busy}
        onCancel={() => setConfirmArchive(false)}
        onConfirm={toggleArchive}
      />
    </>
  );
}

function OverviewTab({ student }: { student: StudentDetail }) {
  const { profile } = student;
  const address = [profile.addressLine, profile.barangay, profile.city, profile.province, profile.zipCode].filter(Boolean).join(", ");
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Current term" value={student.currentEnrollment ? formatYearLevel(student.currentEnrollment.yearLevel) : "Not enrolled"} icon={ClipboardList} hint={student.currentEnrollment?.sectionName ?? student.currentEnrollment?.termLabel} />
        <StatCard label="Total balance" value={formatMoney(student.balance.balance)} icon={Wallet} accent="gold" hint={`${formatMoney(student.balance.totalPaid)} paid of ${formatMoney(student.balance.totalAssessed)}`} />
        <StatCard label="Portal account" value={student.account ? (student.account.isActive ? "Active" : "Deactivated") : "None"} icon={KeyRound} hint={student.account?.lastLoginAt ? `Last login ${formatDateTime(student.account.lastLoginAt)}` : undefined} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Personal information" icon={<Avatar name={student.fullName} size="sm" />} />
          <CardBody>
            <DescriptionList
              items={[
                { label: "Full name", value: student.formalName, wide: true },
                { label: "Date of birth", value: formatDate(student.dateOfBirth, "long") },
                { label: "Sex", value: student.sex === "MALE" ? "Male" : "Female" },
                { label: "Program", value: student.programName, wide: true },
                { label: "Record created", value: formatDateTime(student.createdAt) },
              ]}
            />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Contact & guardian" />
          <CardBody>
            <DescriptionList
              items={[
                { label: "Email", value: profile.email },
                { label: "Contact number", value: profile.contactNumber },
                { label: "Address", value: address, wide: true },
                { label: "Guardian", value: profile.guardianName ? `${profile.guardianName}${profile.guardianRelationship ? ` (${profile.guardianRelationship})` : ""}` : null },
                { label: "Guardian contact", value: profile.guardianContactNumber },
              ]}
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function EnrollmentTab({ student, onChanged }: { student: StudentDetail; onChanged: () => void }) {
  const { can } = useAuth();
  const [creating, setCreating] = useState(false);
  const [managingId, setManagingId] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader
        title="Enrollment history"
        actions={
          can("enrollments:write") &&
          student.status !== "ARCHIVED" && (
            <Button size="sm" onClick={() => setCreating(true)} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
              Enroll in a term
            </Button>
          )
        }
      />
      <DataTable
        caption="Enrollment history"
        rows={student.enrollments}
        getRowKey={(row) => row.id}
        empty={{ title: "No enrollment records yet." }}
        onRowClick={(row) => setManagingId(row.id)}
        columns={[
          { header: "Term", primary: true, cell: (row) => <span className="font-medium">{row.termLabel}</span> },
          { header: "Program", cell: (row) => row.programCode },
          { header: "Year", cell: (row) => formatYearLevel(row.yearLevel) },
          { header: "Section", cell: (row) => row.sectionName ?? "—" },
          { header: "Enrolled on", cell: (row) => formatDate(row.enrollmentDate) },
          { header: "Status", cell: (row) => <StatusBadge kind="enrollment" value={row.status} /> },
          {
            header: "Actions",
            align: "right",
            cell: (row) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={(event) => {
                  event.stopPropagation(); // the row itself is also clickable
                  setManagingId(row.id);
                }}
              >
                Manage
              </Button>
            ),
          },
        ]}
      />
      <EnrollmentFormModal
        open={creating}
        initialStudent={student}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          onChanged();
        }}
      />
      <EnrollmentManageModal enrollmentId={managingId} onClose={() => setManagingId(null)} onChanged={onChanged} />
    </Card>
  );
}

function GradesTab({ studentId }: { studentId: number }) {
  const { data, loading, error, reload } = useApi(() => studentService.grades(studentId), [studentId]);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Loading grades..." />;
  return (
    <>
      <p className="mb-4 text-sm text-ink-muted">Staff view — includes DRAFT grades that the student cannot see yet. General average of published grades: <strong className="text-ink">{data.overallAverageDisplay ?? "—"}</strong></p>
      <AcademicHistoryView
        history={data}
        showStatus
        renderTermActions={(term) => (
          <ButtonLink to={`/admin/enrollments/${term.enrollmentId}/report-card`} variant="ghost" size="sm" leftIcon={<FileText className="size-4" aria-hidden="true" />}>
            Report card
          </ButtonLink>
        )}
      />
    </>
  );
}

function PaymentsTab({ student, onChanged }: { student: StudentDetail; onChanged: () => void }) {
  const { can } = useAuth();
  const payments = useApi(() => studentService.payments(student.id), [student.id]);
  const [recording, setRecording] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const refresh = () => {
    payments.reload();
    onChanged();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total assessed" value={formatMoney(student.balance.totalAssessed)} icon={FileText} />
        <StatCard label="Total payments" value={formatMoney(student.balance.totalPaid)} icon={Wallet} />
        <StatCard label="Remaining balance" value={formatMoney(student.balance.balance)} icon={Wallet} accent="gold" />
      </div>
      <Card>
        <CardHeader
          title="Payment history"
          actions={
            can("payments:record") && (
              <Button size="sm" onClick={() => setRecording(true)} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
                Record payment
              </Button>
            )
          }
        />
        {payments.error ? (
          <ErrorState message={payments.error} onRetry={payments.reload} />
        ) : (
          <DataTable
            caption="Payment history"
            loading={payments.loading}
            loadingLabel="Loading payment history..."
            rows={payments.data ?? []}
            getRowKey={(row) => row.id}
            onRowClick={(row) => setSelectedId(row.id)}
            empty={{ title: "No payment records found." }}
            columns={[
              { header: "Date", cell: (row) => formatDate(row.paymentDate) },
              { header: "Reference", primary: true, cell: (row) => <span className="font-medium">{row.referenceNumber}</span> },
              { header: "Term", cell: (row) => row.termLabel },
              { header: "Method", cell: (row) => PAYMENT_METHOD_LABELS[row.paymentMethod] },
              { header: "Amount", align: "right", cell: (row) => <span className={`tabular-nums ${row.status === "VOIDED" ? "line-through text-ink-muted" : "font-medium"}`}>{formatMoney(row.amount)}</span> },
              { header: "Status", cell: (row) => <StatusBadge kind="payment" value={row.status} /> },
            ]}
          />
        )}
      </Card>
      <RecordPaymentModal
        open={recording}
        initialStudent={student}
        onClose={() => setRecording(false)}
        onSaved={() => {
          setRecording(false);
          refresh();
        }}
      />
      <PaymentDetailModal paymentId={selectedId} onClose={() => setSelectedId(null)} onChanged={refresh} />
    </div>
  );
}

function AccountTab({ student, onChanged }: { student: StudentDetail; onChanged: () => void }) {
  const { can } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState(student.profile.email ?? "");
  const [sendEmail, setSendEmail] = useState(false);
  const [busy, setBusy] = useState(false);
  const [credentials, setCredentials] = useState<IssuedCredentials | null>(null);
  const [confirm, setConfirm] = useState<"reset" | "toggle" | null>(null);
  const account = student.account;
  const canManage = can("student-accounts:manage") && student.status !== "ARCHIVED";

  async function run(action: () => Promise<{ data: IssuedCredentials | { isActive: boolean } }>, successTitle: string) {
    setBusy(true);
    try {
      const response = await action();
      if ("temporaryPassword" in response.data) setCredentials(response.data);
      toast.success(successTitle);
      setConfirm(null);
      onChanged();
    } catch (actionError) {
      toast.error("Action failed", getErrorMessage(actionError));
    } finally {
      setBusy(false);
    }
  }

  if (!account) {
    return (
      <Card>
        <CardHeader title="Student Portal account" />
        <CardBody>
          <EmptyState icon={KeyRound} title="This student has no portal account yet." description="Username will be the student ID. The temporary password is the birthdate in MMDDYYYY format." />
          {canManage && (
            <div className="mx-auto max-w-md space-y-4">
              <TextInput label="Account email (optional)" type="email" value={email} onChange={(event) => setEmail(event.target.value)} hint="Used for password reset links." />
              <Checkbox label="Email the student that their account is ready" description="The email does not contain the password." checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} disabled={!email} />
              <Button fullWidth loading={busy} leftIcon={<UserPlus className="size-4" aria-hidden="true" />} onClick={() => run(() => studentService.createAccount(student.id, { email: email || null, sendEmail: sendEmail && Boolean(email) }), "Portal account created")}>
                Create portal account
              </Button>
            </div>
          )}
        </CardBody>
        <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} title="Portal account created" />
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Student Portal account" />
      <CardBody className="space-y-5">
        <DescriptionList
          items={[
            { label: "Username", value: <span className="font-mono">{account.username}</span> },
            { label: "Account email", value: account.email },
            {
              label: "Status",
              value: (
                <span className="flex flex-wrap gap-1.5">
                  <StatusBadge kind="account" value={account.isActive ? "ACTIVE" : "INACTIVE"} />
                  {account.isLocked && <StatusBadge kind="account" value="LOCKED" />}
                  {account.mustChangePassword && <StatusBadge kind="account" value="TEMPORARY" />}
                </span>
              ),
            },
            { label: "Last login", value: formatDateTime(account.lastLoginAt) },
            { label: "Created", value: formatDateTime(account.createdAt) },
          ]}
        />
        {canManage && (
          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button variant="secondary" onClick={() => setConfirm("reset")} leftIcon={<KeyRound className="size-4" aria-hidden="true" />}>
              Issue new temporary password
            </Button>
            <Button
              variant={account.isActive ? "danger" : "secondary"}
              onClick={() => setConfirm("toggle")}
              leftIcon={account.isActive ? <ShieldOff className="size-4" aria-hidden="true" /> : <ShieldCheck className="size-4" aria-hidden="true" />}
            >
              {account.isActive ? "Deactivate account" : "Activate account"}
            </Button>
          </div>
        )}
      </CardBody>

      <ConfirmDialog
        open={confirm === "reset"}
        title="Issue a new temporary password?"
        description="The current password stops working immediately and the student is signed out everywhere. You will see the new temporary password once."
        confirmLabel="Issue password"
        loading={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={(event) => {
          event.preventDefault();
          run(() => studentService.resetPassword(student.id), "New temporary password issued");
        }}
      />
      <ConfirmDialog
        open={confirm === "toggle"}
        tone={account.isActive ? "danger" : "primary"}
        title={account.isActive ? "Deactivate this account?" : "Activate this account?"}
        description={account.isActive ? "The student will be signed out and will not be able to log in until the account is activated again." : "The student will be able to log in again."}
        confirmLabel={account.isActive ? "Deactivate" : "Activate"}
        loading={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={() => run(() => studentService.setAccountActive(student.id, !account.isActive), account.isActive ? "Account deactivated" : "Account activated")}
      />
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </Card>
  );
}
