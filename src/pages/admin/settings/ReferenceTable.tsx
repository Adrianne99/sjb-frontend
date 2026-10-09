// A reusable "list + add/edit dialog" for simple reference data
// (programs, subjects, instructors, rooms, sections). Each tab only describes
// its columns and form fields; this component does the rest.
// Pass `remove` to also show a Delete button (with an "Are you sure?" step).
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Card, CardHeader } from "@/components/card/Card";
import { Checkbox } from "@/components/form/Checkbox";
import { Select, type SelectOption } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Textarea } from "@/components/form/Textarea";
import { ConfirmDialog } from "@/components/modal/ConfirmDialog";
import { Modal } from "@/components/modal/Modal";
import { DataTable, type Column } from "@/components/table/DataTable";
import { Button, IconButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { useFormErrors } from "@/hooks/useFormErrors";
import { invalidateLookups } from "@/hooks/useLookups";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";

export type FormValues = Record<string, string | boolean>;

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "select" | "checkbox" | "textarea";
  options?: SelectOption[];
  required?: boolean;
  hint?: string;
  /** Spans both columns of the form grid. */
  wide?: boolean;
}

interface ReferenceTableProps<T extends { id: number }> {
  title: string;
  description?: string;
  entityLabel: string;
  rows: T[] | undefined;
  loading: boolean;
  error: string | null;
  reload: () => void;
  columns: Column<T>[];
  fields: FieldConfig[];
  toForm: (row: T | null) => FormValues;
  toPayload: (values: FormValues) => object;
  create: (payload: object) => Promise<unknown>;
  update: (id: number, payload: object) => Promise<unknown>;
  /** Optional: delete a row. The server refuses rows that are still in use. */
  remove?: (id: number) => Promise<unknown>;
  /** Name shown in the delete question, e.g. "IT 1-A". */
  rowLabel?: (row: T) => string;
  toolbar?: ReactNode;
}

export function ReferenceTable<T extends { id: number }>(props: ReferenceTableProps<T>) {
  const [editing, setEditing] = useState<T | "new" | null>(null);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const { remove, rowLabel, entityLabel } = props;

  async function confirmDelete() {
    if (!deleting || !remove) return;
    setBusy(true);
    try {
      await remove(deleting.id);
      toast.success(`${entityLabel[0].toUpperCase()}${entityLabel.slice(1)} deleted`);
      invalidateLookups(); // dropdowns elsewhere drop it too
      setDeleting(null);
      props.reload();
    } catch (error) {
      toast.error(`Could not delete this ${entityLabel}`, getErrorMessage(error));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader
        title={props.title}
        description={props.description}
        actions={
          <Button size="sm" onClick={() => setEditing("new")} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
            Add {props.entityLabel}
          </Button>
        }
      />
      {props.toolbar && <div className="border-b border-border p-4">{props.toolbar}</div>}
      {props.error ? (
        <ErrorState message={props.error} onRetry={props.reload} />
      ) : (
        <DataTable<T>
          caption={props.title}
          loading={props.loading}
          rows={props.rows ?? []}
          getRowKey={(row) => row.id}
          empty={{ title: `No ${props.entityLabel}s yet.` }}
          columns={[
            ...props.columns,
            {
              header: "Actions",
              align: "right",
              cell: (row) => (
                <span className="inline-flex gap-1">
                  <IconButton label={`Edit ${props.entityLabel}`} size="sm" onClick={() => setEditing(row)}>
                    <Pencil className="size-4" aria-hidden="true" />
                  </IconButton>
                  {remove && (
                    <IconButton label={`Delete ${props.entityLabel}`} size="sm" onClick={() => setDeleting(row)}>
                      <Trash2 className="size-4 text-danger-600" aria-hidden="true" />
                    </IconButton>
                  )}
                </span>
              ),
            },
          ]}
        />
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={`${editing === "new" ? "Add" : "Edit"} ${props.entityLabel}`}>
        {editing !== null && (
          <ReferenceForm
            key={editing === "new" ? "new" : editing.id}
            fields={props.fields}
            initial={props.toForm(editing === "new" ? null : editing)}
            onCancel={() => setEditing(null)}
            onSubmit={async (values) => {
              const payload = props.toPayload(values);
              if (editing === "new") await props.create(payload);
              else await props.update(editing.id, payload);
            }}
            onSaved={() => {
              invalidateLookups(); // dropdowns elsewhere pick up the change
              setEditing(null);
              props.reload();
            }}
            entityLabel={props.entityLabel}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        tone="danger"
        title={`Delete this ${entityLabel}?`}
        description={`${deleting && rowLabel ? rowLabel(deleting) : `This ${entityLabel}`} will be removed. This only works if nothing uses it yet (students, class schedules, grades or attendance).`}
        confirmLabel="Delete"
        loading={busy}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}

function ReferenceForm({
  fields,
  initial,
  onCancel,
  onSubmit,
  onSaved,
  entityLabel,
}: {
  fields: FieldConfig[];
  initial: FormValues;
  onCancel: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
  onSaved: () => void;
  entityLabel: string;
}) {
  const toast = useToast();
  const [values, setValues] = useState<FormValues>(initial);
  const [saving, setSaving] = useState(false);
  const { errors, setFromError } = useFormErrors();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
      toast.success(`Saved ${entityLabel}`);
      onSaved();
    } catch (error) {
      if (!setFromError(error)) toast.error(`Could not save ${entityLabel}`, getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const common = { label: field.label, required: field.required, hint: field.hint, error: errors[field.name] };
          const value = values[field.name];
          const set = (next: string | boolean) => setValues((current) => ({ ...current, [field.name]: next }));
          const className = field.wide ? "sm:col-span-2" : undefined;

          if (field.type === "checkbox") {
            return <Checkbox key={field.name} label={field.label} checked={Boolean(value)} onChange={(event) => set(event.target.checked)} className={className ?? "sm:col-span-2"} />;
          }
          if (field.type === "select") {
            return <Select key={field.name} {...common} className={className} placeholder="Select..." options={field.options ?? []} value={String(value ?? "")} onChange={(event) => set(event.target.value)} />;
          }
          if (field.type === "textarea") {
            return <Textarea key={field.name} {...common} className={className ?? "sm:col-span-2"} rows={3} value={String(value ?? "")} onChange={(event) => set(event.target.value)} />;
          }
          return <TextInput key={field.name} {...common} className={className} type={field.type ?? "text"} value={String(value ?? "")} onChange={(event) => set(event.target.value)} />;
        })}
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Save
        </Button>
      </div>
    </form>
  );
}
