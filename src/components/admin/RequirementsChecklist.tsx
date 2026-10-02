// One student's admission requirements (Form 137, Diploma, Form 138, Good Moral).
// Staff mark each document Pending -> Submitted -> Verified. Every change is audited.
import { CircleCheck, FileCheck2, Save } from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card, CardHeader } from "@/components/card/Card";
import { Select } from "@/components/form/Select";
import { TextInput } from "@/components/form/TextInput";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { requirementService } from "@/services/requirement.service";
import type { RequirementStatus, StudentChecklist, StudentRequirementItem } from "@/types";
import { formatDate, formatDateTime, todayISO } from "@/utils/format";
import { REQUIREMENT_STATUS_LABELS, toOptions } from "@/utils/labels";

export function RequirementsChecklist({ studentId, readOnly = false }: { studentId: number; readOnly?: boolean }) {
  const { can } = useAuth();
  const { data, loading, error, reload, setData } = useApi(() => requirementService.studentChecklist(studentId), [studentId]);
  const canEdit = can("requirements:write") && !readOnly;

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) return <LoadingState label="Loading requirements..." />;

  const { summary } = data;
  return (
    <Card>
      <CardHeader
        title="Admission requirements"
        icon={<FileCheck2 className="size-5" aria-hidden="true" />}
        description={`${summary.verified} of ${summary.total} verified · ${summary.submitted} submitted · ${summary.pending} pending`}
        actions={
          summary.complete ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-sm font-medium text-success-700">
              <CircleCheck className="size-4" aria-hidden="true" /> Complete
            </span>
          ) : undefined
        }
      />
      {data.items.length === 0 ? (
        <EmptyState title="No requirements are set up." description="An administrator can add them in Settings → Requirements." />
      ) : (
        <ul className="divide-y divide-border">
          {data.items.map((item) => (
            <RequirementRow key={item.requirement.id} studentId={studentId} item={item} canEdit={canEdit} onSaved={setData} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function RequirementRow({ studentId, item, canEdit, onSaved }: { studentId: number; item: StudentRequirementItem; canEdit: boolean; onSaved: (checklist: StudentChecklist) => void }) {
  const toast = useToast();
  const [status, setStatus] = useState<RequirementStatus>(item.status);
  const [submittedDate, setSubmittedDate] = useState(item.submittedDate ?? "");
  const [remarks, setRemarks] = useState(item.remarks ?? "");
  const [saving, setSaving] = useState(false);

  const changed = status !== item.status || submittedDate !== (item.submittedDate ?? "") || remarks !== (item.remarks ?? "");

  async function save() {
    setSaving(true);
    try {
      const response = await requirementService.updateStudent(studentId, item.requirement.id, {
        status,
        submittedDate: status === "PENDING" ? null : submittedDate || todayISO(),
        remarks: remarks.trim() || null,
      });
      toast.success(`${item.requirement.name}: ${REQUIREMENT_STATUS_LABELS[status]}`);
      onSaved(response.data);
    } catch (error) {
      toast.error("Could not save", getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-ink">{item.requirement.name}</p>
          {item.requirement.description && <p className="text-sm text-ink-muted">{item.requirement.description}</p>}
          {item.updatedAt && (
            <p className="mt-1 text-xs text-ink-muted">
              {item.submittedDate && <>Received {formatDate(item.submittedDate)} · </>}
              Updated by {item.updatedBy ?? "—"} on {formatDateTime(item.updatedAt)}
            </p>
          )}
        </div>
        <StatusBadge kind="requirement" value={item.status} />
      </div>

      {canEdit && (
        <div className="mt-3 grid gap-3 sm:grid-cols-[10rem_10rem_1fr_auto] sm:items-end">
          <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value as RequirementStatus)} options={toOptions(REQUIREMENT_STATUS_LABELS)} />
          <TextInput label="Date received" type="date" value={status === "PENDING" ? "" : submittedDate} disabled={status === "PENDING"} onChange={(event) => setSubmittedDate(event.target.value)} />
          <TextInput label="Remarks" placeholder="e.g. Photocopy only, original to follow" maxLength={255} value={remarks} onChange={(event) => setRemarks(event.target.value)} />
          <Button variant="secondary" onClick={save} loading={saving} disabled={!changed} leftIcon={<Save className="size-4" aria-hidden="true" />}>
            Save
          </Button>
        </div>
      )}
    </li>
  );
}
