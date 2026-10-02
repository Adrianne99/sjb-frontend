// A reusable "list + add/edit dialog" for simple reference data
// (programs, subjects, instructors, rooms, sections). Each tab only describes
// its columns and form fields; this component does the rest.
import { Pencil, Plus } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Card, CardHeader } from "@/components/card/Card";
import { Checkbox } from "@/components/form/Checkbox";
import { Select, type SelectOption } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Textarea } from "@/components/form/Textarea";
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
  toolbar?: ReactNode;
}

export function ReferenceTable<T extends { id: number }>(props: ReferenceTableProps<T>) {
  const [editing, setEditing] = useState<T | "new" | null>(null);

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
                <IconButton label={`Edit ${props.entityLabel}`} size="sm" onClick={() => setEditing(row)}>
                  <Pencil className="size-4" aria-hidden="true" />
                </IconButton>
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
      <div className="grid gap-4 sm:grid-cols-2">
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
