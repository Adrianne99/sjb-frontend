// User accounts (ADMIN only). Staff/admin accounts are created here; student
// accounts are created from the student's record.
import { KeyRound, Pencil, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { CredentialsModal } from "@/components/admin/CredentialsModal";
import { Badge } from "@/components/badge/Badge";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card } from "@/components/card/Card";
import { SearchInput } from "@/components/form/SearchInput";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { Modal } from "@/components/modal/Modal";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useQueryState } from "@/hooks/useQueryState";
import { useSearchBox } from "@/hooks/useSearchBox";
import { useToast } from "@/hooks/useToast";
import { userService } from "@/services/admin.service";
import { getErrorMessage } from "@/services/api";
import type { IssuedCredentials, Role, UserAccount } from "@/types";
import { formatDateTime } from "@/utils/format";

const ROLE_LABELS: Record<Role, string> = { ADMIN: "Administrator", STAFF: "Staff", STUDENT: "Student" };
const ROLE_TONE = { ADMIN: "gold", STAFF: "info", STUDENT: "neutral" } as const;

type PendingAction = { kind: "role"; user: UserAccount; role: Role } | { kind: "active"; user: UserAccount } | { kind: "reset"; user: UserAccount };

export default function UsersPage() {
  useDocumentTitle("User Accounts");
  const { user: me } = useAuth();
  const toast = useToast();
  const [filters, setFilter] = useQueryState({ search: "", role: "", isActive: "", page: "1" });
  const [searchText, setSearchText] = useSearchBox(filters.search, (value) => setFilter("search", value));
  const { data, loading, error, reload } = useApi(() => userService.list({ ...filters, pageSize: 20 }), [filters.search, filters.role, filters.isActive, filters.page]);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<UserAccount | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [busy, setBusy] = useState(false);
  const [credentials, setCredentials] = useState<IssuedCredentials | null>(null);

  async function runPending() {
    if (!pending) return;
    setBusy(true);
    try {
      if (pending.kind === "reset") {
        const response = await userService.resetPassword(pending.user.id);
        setCredentials(response.data);
      } else if (pending.kind === "role") {
        await userService.update(pending.user.id, { role: pending.role });
        toast.success("Role changed", `${pending.user.username} is now ${ROLE_LABELS[pending.role]}. They were signed out.`);
      } else {
        await userService.update(pending.user.id, { isActive: !pending.user.isActive });
        toast.success(pending.user.isActive ? "Account deactivated" : "Account activated");
      }
      setPending(null);
      reload();
    } catch (actionError) {
      toast.error("Action failed", getErrorMessage(actionError));
    } finally {
      setBusy(false);
    }
  }

  const confirmText = (() => {
    if (!pending) return { title: "", description: "", label: "" };
    if (pending.kind === "reset") return { title: "Issue a new temporary password?", description: `${pending.user.username}'s current password stops working immediately and they are signed out everywhere.`, label: "Issue password" };
    if (pending.kind === "role")
      return { title: "Change this user's role?", description: `${pending.user.displayName} will change from ${ROLE_LABELS[pending.user.role]} to ${ROLE_LABELS[pending.role]}. Their permissions change immediately and they will be signed out.`, label: "Change role" };
    return pending.user.isActive
      ? { title: "Deactivate this account?", description: `${pending.user.displayName} will be signed out and cannot log in until reactivated.`, label: "Deactivate" }
      : { title: "Activate this account?", description: `${pending.user.displayName} will be able to log in again.`, label: "Activate" };
  })();

  return (
    <>
      <PageHeader
        title="User Accounts"
        description="Manage staff and administrator accounts, roles and access."
        actions={
          <Button onClick={() => setCreating(true)} leftIcon={<UserPlus className="size-4" aria-hidden="true" />}>
            New staff account
          </Button>
        }
      />
      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-4">
          <SearchInput value={searchText} onChange={setSearchText} label="Search accounts" placeholder="Name, username or email..." className="sm:col-span-2" />
          <Select label="Role" hideLabel placeholder="All roles" value={filters.role} onChange={(event) => setFilter("role", event.target.value)} options={(Object.keys(ROLE_LABELS) as Role[]).map((role) => ({ value: role, label: ROLE_LABELS[role] }))} />
          <Select
            label="Status"
            hideLabel
            placeholder="Active & deactivated"
            value={filters.isActive}
            onChange={(event) => setFilter("isActive", event.target.value)}
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Deactivated" },
            ]}
          />
        </div>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <DataTable<UserAccount>
              caption="User accounts"
              loading={loading}
              rows={data?.items ?? []}
              getRowKey={(row) => row.id}
              empty={{ title: "No accounts found." }}
              columns={[
                {
                  header: "Name",
                  primary: true,
                  cell: (row) => (
                    <div>
                      <p className="font-medium">
                        {row.studentId ? (
                          <Link to={`/admin/students/${row.studentId}?tab=account`} className="text-primary-800 hover:underline">
                            {row.displayName}
                          </Link>
                        ) : (
                          row.displayName
                        )}
                        {row.id === me?.id && <span className="ml-2 text-xs text-ink-muted">(you)</span>}
                      </p>
                      <p className="text-xs text-ink-muted">{row.position ?? row.email}</p>
                    </div>
                  ),
                },
                { header: "Username", cell: (row) => <span className="font-mono text-xs">{row.username}</span> },
                { header: "Role", cell: (row) => <Badge tone={ROLE_TONE[row.role]}>{ROLE_LABELS[row.role]}</Badge> },
                {
                  header: "Status",
                  cell: (row) => (
                    <span className="flex flex-wrap gap-1">
                      <StatusBadge kind="account" value={row.isActive ? "ACTIVE" : "INACTIVE"} />
                      {row.isLocked && <StatusBadge kind="account" value="LOCKED" />}
                      {row.mustChangePassword && <StatusBadge kind="account" value="TEMPORARY" />}
                    </span>
                  ),
                },
                { header: "Last login", cell: (row) => formatDateTime(row.lastLoginAt), hideOnMobile: true },
                {
                  header: "Actions",
                  align: "right",
                  cell: (row) =>
                    row.role === "STUDENT" ? (
                      <Link to={`/admin/students/${row.studentId}?tab=account`} className="text-sm font-medium text-primary-700 hover:underline">
                        Manage
                      </Link>
                    ) : (
                      <ActionMenu
                        label={`Actions for ${row.displayName}`}
                        items={[
                          { label: "Edit details", icon: Pencil, onClick: () => setEditing(row) },
                          ...(row.id !== me?.id
                            ? [
                                { label: row.role === "ADMIN" ? "Make staff" : "Make administrator", icon: ShieldCheck, onClick: () => setPending({ kind: "role", user: row, role: (row.role === "ADMIN" ? "STAFF" : "ADMIN") as Role }) },
                                { label: row.isActive ? "Deactivate" : "Activate", icon: ShieldOff, danger: row.isActive, onClick: () => setPending({ kind: "active", user: row }) },
                              ]
                            : []),
                          { label: "Reset password", icon: KeyRound, onClick: () => setPending({ kind: "reset", user: row }) },
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

      <StaffFormModal
        open={creating || editing !== null}
        user={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={(issued) => {
          setCreating(false);
          setEditing(null);
          if (issued) setCredentials(issued);
          reload();
        }}
      />
      <ConfirmDialog
        open={pending !== null}
        tone={pending?.kind === "active" && pending.user.isActive ? "danger" : "primary"}
        title={confirmText.title}
        description={confirmText.description}
        confirmLabel={confirmText.label}
        loading={busy}
        onCancel={() => setPending(null)}
        onConfirm={runPending}
      />
      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </>
  );
}

/** "María Clara" → "maria.clara": the suggested username for a new staff account. */
function usernameFromFirstName(firstName: string) {
  return firstName
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // remove accents (ñ → n, é → e)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ".")
    .replace(/[^a-z0-9._-]/g, "");
}

function StaffFormModal({ open, user, onClose, onSaved }: { open: boolean; user: UserAccount | null; onClose: () => void; onSaved: (credentials: IssuedCredentials | null) => void }) {
  return (
    <Modal open={open} onClose={onClose} title={user ? "Edit account" : "New staff account"} size="md">
      {open && <StaffForm key={user?.id ?? "new"} user={user} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}

function StaffForm({ user, onClose, onSaved }: { user: UserAccount | null; onClose: () => void; onSaved: (credentials: IssuedCredentials | null) => void }) {
  const toast = useToast();
  const [values, setValues] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    position: user?.position ?? "",
    role: (user?.role ?? "STAFF") as Role,
  });
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();
  // The username follows the first name until the admin types their own.
  const [usernameEdited, setUsernameEdited] = useState(false);
  const set = (field: keyof typeof values) => (event: { target: { value: string } }) => {
    const value = event.target.value;
    if (field === "username") setUsernameEdited(true);
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === "firstName" && !user && !usernameEdited ? { username: usernameFromFirstName(value) } : {}),
    }));
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (user) {
        await userService.update(user.id, { email: values.email || null, firstName: values.firstName, lastName: values.lastName, position: values.position || null });
        toast.success("Account updated");
        onSaved(null);
      } else {
        const response = await userService.create({ ...values, position: values.position || null });
        toast.success("Account created");
        onSaved(response.data.credentials);
      }
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save account", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {!user && <Alert tone="info">A random temporary password is generated. The user must change it at first login.</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="First name" required value={values.firstName} onChange={set("firstName")} error={errors.firstName} />
        <TextInput label="Last name" required value={values.lastName} onChange={set("lastName")} error={errors.lastName} />
        {!user && <TextInput label="Username" required value={values.username} onChange={set("username")} error={errors.username} hint="Filled in from the first name. If it is taken, add the last name, e.g. maria.santos" />}
        <TextInput label="Email" type="email" required={!user} value={values.email} onChange={set("email")} error={errors.email} />
        <TextInput label="Position" placeholder="e.g. Registrar" value={values.position} onChange={set("position")} error={errors.position} />
        {!user && (
          <Select
            label="Role"
            value={values.role}
            onChange={set("role")}
            options={[
              { value: "STAFF", label: "Staff" },
              { value: "ADMIN", label: "Administrator" },
            ]}
            hint="Staff never receive administrator rights automatically."
          />
        )}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {user ? "Save changes" : "Create account"}
        </Button>
      </div>
    </form>
  );
}
