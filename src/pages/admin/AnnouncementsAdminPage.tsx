// Create and manage announcements. PUBLIC ones appear on the landing page and
// in the student portal; STUDENTS ones only in the portal.
import { ImagePlus, Mail, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Badge } from "@/components/badge/Badge";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card } from "@/components/card/Card";
import { SearchInput } from "@/components/form/SearchInput";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Textarea } from "@/components/form/Textarea";
import { Modal } from "@/components/modal/Modal";
import { DataTable } from "@/components/table/DataTable";
import { Pagination } from "@/components/table/Pagination";
import { Button, IconButton } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFormErrors } from "@/hooks/useFormErrors";
import { useQueryState } from "@/hooks/useQueryState";
import { useSearchBox } from "@/hooks/useSearchBox";
import { useToast } from "@/hooks/useToast";
import { announcementService, type AnnouncementInput } from "@/services/admin.service";
import { apiUrl, getErrorMessage } from "@/services/api";
import type { Announcement } from "@/types";
import { formatDateTime } from "@/utils/format";
import { resizePhoto } from "@/utils/image";
import { ANNOUNCEMENT_STATUS_LABELS, AUDIENCE_LABELS, toOptions } from "@/utils/labels";

/** ISO timestamp -> value for <input type="datetime-local"> (Philippine time). */
function toLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  const manila = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  return manila.toISOString().slice(0, 16);
}

/** <input type="datetime-local"> value (Philippine time) -> ISO timestamp. */
function fromLocalInput(value: string) {
  return value ? new Date(`${value}:00+08:00`).toISOString() : null;
}

export default function AnnouncementsAdminPage() {
  useDocumentTitle("Announcements");
  const [filters, setFilter] = useQueryState({ search: "", status: "", audience: "", page: "1" });
  const [searchText, setSearchText] = useSearchBox(filters.search, (value) => setFilter("search", value));
  const { data, loading, error, reload } = useApi(() => announcementService.list({ ...filters, pageSize: 20 }), [filters.search, filters.status, filters.audience, filters.page]);
  const [editing, setEditing] = useState<Announcement | "new" | null>(null);

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Only published announcements within their publish and expiration dates are shown to the public and students."
        actions={
          <Button onClick={() => setEditing("new")} leftIcon={<Plus className="size-4" aria-hidden="true" />}>
            New announcement
          </Button>
        }
      />

      <Card>
        <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-4">
          <SearchInput value={searchText} onChange={setSearchText} label="Search announcements" placeholder="Search title or content..." className="sm:col-span-2" />
          <Select label="Status" hideLabel placeholder="All statuses" value={filters.status} onChange={(event) => setFilter("status", event.target.value)} options={toOptions(ANNOUNCEMENT_STATUS_LABELS)} />
          <Select label="Audience" hideLabel placeholder="All audiences" value={filters.audience} onChange={(event) => setFilter("audience", event.target.value)} options={toOptions(AUDIENCE_LABELS)} />
        </div>
        {error ? (
          <ErrorState message={error} onRetry={reload} />
        ) : (
          <>
            <DataTable<Announcement>
              caption="Announcements"
              loading={loading}
              rows={data?.items ?? []}
              getRowKey={(row) => row.id}
              onRowClick={(row) => setEditing(row)}
              empty={{ title: "No announcements available.", description: "Create one to share news with students and visitors." }}
              columns={[
                {
                  header: "Title",
                  primary: true,
                  cell: (row) => (
                    <div className="max-w-md">
                      <p className="font-medium">{row.title}</p>
                      <p className="line-clamp-1 text-xs text-ink-muted">{row.content}</p>
                    </div>
                  ),
                },
                { header: "Audience", cell: (row) => <Badge tone={row.audience === "PUBLIC" ? "info" : "gold"}>{AUDIENCE_LABELS[row.audience]}</Badge> },
                {
                  header: "Status",
                  cell: (row) => (
                    <div>
                      <StatusBadge kind="announcement" value={row.status ?? "DRAFT"} />
                      {row.emailedAt && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                          <Mail className="size-3" aria-hidden="true" /> Emailed {formatDateTime(row.emailedAt)}
                        </p>
                      )}
                    </div>
                  ),
                },
                { header: "Publish date", cell: (row) => formatDateTime(row.publishDate) },
                { header: "Expires", cell: (row) => (row.expirationDate ? formatDateTime(row.expirationDate) : "—") },
                {
                  header: "Actions",
                  align: "right",
                  cell: (row) => (
                    <IconButton label={`Edit ${row.title}`} size="sm" onClick={(event) => { event.stopPropagation(); setEditing(row); }}>
                      <Pencil className="size-4" aria-hidden="true" />
                    </IconButton>
                  ),
                },
              ]}
            />
            {data && <Pagination meta={data.meta} onPageChange={(page) => setFilter("page", String(page))} />}
          </>
        )}
      </Card>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New announcement" : "Edit announcement"} size="lg">
        {editing !== null && (
          <AnnouncementForm
            key={editing === "new" ? "new" : editing.id}
            announcement={editing === "new" ? null : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              reload();
            }}
          />
        )}
      </Modal>
    </>
  );
}

/** The photo chosen in the form: a new file, "remove the current one", or unchanged. */
interface PhotoChoice {
  file: Blob | null;
  /** Temporary browser link to show the new photo before it is uploaded. */
  previewUrl: string | null;
  remove: boolean;
}

/**
 * Cover photo picker. The photo is shrunk in the browser (max 1600 px wide, JPEG)
 * and uploaded after the announcement is saved.
 */
function PhotoPicker({ currentPath, choice, onChange }: { currentPath: string | null | undefined; choice: PhotoChoice; onChange: (choice: PhotoChoice) => void }) {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preparing, setPreparing] = useState(false);

  // Free the temporary preview link when it is replaced or the form closes.
  useEffect(() => {
    const url = choice.previewUrl;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [choice.previewUrl]);

  const shown = choice.previewUrl ?? (choice.remove || !currentPath ? null : apiUrl(currentPath));

  async function handleFile(selected: File | undefined) {
    if (!selected) return;
    setPreparing(true);
    try {
      const resized = await resizePhoto(selected);
      onChange({ file: resized, previewUrl: URL.createObjectURL(resized), remove: false });
    } catch (error) {
      toast.error("Could not use this photo", (error as Error).message);
    } finally {
      setPreparing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink-soft">Cover photo</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="aspect-16/10 w-full overflow-hidden rounded-xl border border-border bg-surface-muted sm:w-56">
          {shown ? (
            <img src={shown} alt="Selected cover photo" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-ink-muted">No photo</div>
          )}
        </div>
        <div className="space-y-2">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" id="announcement-photo" onChange={(event) => void handleFile(event.target.files?.[0])} />
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" loading={preparing} onClick={() => inputRef.current?.click()} leftIcon={<ImagePlus className="size-4" aria-hidden="true" />}>
              {shown ? "Change photo" : "Add photo"}
            </Button>
            {shown && (
              <Button variant="ghost" size="sm" onClick={() => onChange({ file: null, previewUrl: null, remove: true })} leftIcon={<Trash2 className="size-4" aria-hidden="true" />}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-ink-muted">JPG, PNG or WebP. Shown as a wide photo (cropped to fit) on the website and the announcement page.</p>
        </div>
      </div>
    </div>
  );
}

function AnnouncementForm({ announcement, onCancel, onSaved }: { announcement: Announcement | null; onCancel: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState({
    title: announcement?.title ?? "",
    content: announcement?.content ?? "",
    audience: announcement?.audience ?? "PUBLIC",
    status: announcement?.status ?? "DRAFT",
    publishDate: toLocalInput(announcement?.publishDate ?? new Date().toISOString()),
    expirationDate: toLocalInput(announcement?.expirationDate),
  });
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<PhotoChoice>({ file: null, previewUrl: null, remove: false });
  const { errors, setFromError } = useFormErrors();
  const set = (field: keyof typeof values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const input: AnnouncementInput = {
      title: values.title,
      content: values.content,
      audience: values.audience as AnnouncementInput["audience"],
      status: values.status as AnnouncementInput["status"],
      publishDate: fromLocalInput(values.publishDate) ?? new Date().toISOString(),
      expirationDate: fromLocalInput(values.expirationDate),
    };
    try {
      const saved = announcement ? await announcementService.update(announcement.id, input) : await announcementService.create(input);
      // Then the photo (it needs the announcement's id).
      if (photo.file) await announcementService.uploadImage(saved.data.id, photo.file);
      else if (photo.remove && announcement?.imagePath) await announcementService.removeImage(saved.data.id);
      toast.success(announcement ? "Announcement updated" : "Announcement saved");
      onSaved();
    } catch (error) {
      if (!setFromError(error)) toast.error("Could not save announcement", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <TextInput label="Title" required maxLength={200} value={values.title} onChange={set("title")} error={errors.title} />
      <PhotoPicker currentPath={announcement?.imagePath} choice={photo} onChange={setPhoto} />
      <Textarea label="Content" required rows={7} value={values.content} onChange={set("content")} error={errors.content} hint="Plain text. Line breaks are kept." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Audience" value={values.audience} onChange={set("audience")} options={toOptions(AUDIENCE_LABELS)} />
        <Select label="Status" value={values.status} onChange={set("status")} options={toOptions(ANNOUNCEMENT_STATUS_LABELS)} />
        <TextInput label="Publish date" type="datetime-local" required value={values.publishDate} onChange={set("publishDate")} error={errors.publishDate} />
        <TextInput label="Expiration date" type="datetime-local" value={values.expirationDate} onChange={set("expirationDate")} error={errors.expirationDate} hint="Optional — hide automatically after this time." />
      </div>
      <p className="flex items-center gap-2 text-xs text-ink-muted">
        <Megaphone className="size-3.5" aria-hidden="true" /> Times are Philippine time.
      </p>
      {values.status === "PUBLISHED" && (
        <p className="flex items-start gap-2 rounded-md bg-primary-50 px-3 py-2 text-xs text-primary-900">
          <Mail className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {announcement?.emailedAt
            ? `Already emailed to students on ${formatDateTime(announcement.emailedAt)} — it will not be sent again.`
            : "Publishing emails this announcement to all students (once). If the publish date is later, it is emailed when it goes live."}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {values.status === "PUBLISHED" ? "Save & publish" : "Save"}
        </Button>
      </div>
    </form>
  );
}
