// "Submit for review" pieces shared by the staff Grades page and the teacher's
// My Classes page:
//   <SubmissionBadge>       short status in the class list
//   <SubmissionBanner>      what is happening with this class's grades
//   <ReturnGradesModal>     staff send submitted grades back with a note
import { useState, type FormEvent } from "react";
import { Badge } from "@/components/badge/Badge";
import { Textarea } from "@/components/form/Textarea";
import { Modal } from "@/components/modal/Modal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/services/api";
import { gradeService, type ClassSelector } from "@/services/grade.service";
import type { GradeSubmission } from "@/types";
import { formatDateTime } from "@/utils/format";

export function SubmissionBadge({ submission }: { submission: GradeSubmission | null }) {
  if (!submission) return <span className="text-xs text-ink-muted">Not submitted</span>;
  if (submission.status === "SUBMITTED") return <Badge tone="info">Ready to publish</Badge>;
  if (submission.status === "RETURNED") return <Badge tone="warning">Returned to teacher</Badge>;
  return <Badge tone="success">Published</Badge>;
}

/** `teacher` = the teacher's own view (wording is "you"); otherwise the staff view. */
export function SubmissionBanner({ submission, teacher }: { submission: GradeSubmission | null; teacher: boolean }) {
  if (!submission) return null;

  if (submission.status === "SUBMITTED") {
    return (
      <Alert tone="info">
        {teacher
          ? `You submitted these grades for review on ${formatDateTime(submission.submittedAt)}. They are locked until the Registrar's Office publishes them or returns them to you.`
          : `${submission.submittedBy ?? "The teacher"} submitted these grades for review on ${formatDateTime(submission.submittedAt)}. Check them, then publish — or return them with a note.`}
      </Alert>
    );
  }
  if (submission.status === "RETURNED") {
    return (
      <Alert tone="warning">
        {teacher ? "The Registrar's Office returned these grades to you" : `Returned to the teacher by ${submission.reviewedBy ?? "staff"}`}
        {submission.reviewedAt ? ` on ${formatDateTime(submission.reviewedAt)}` : ""}.
        {submission.note && (
          <>
            {" "}
            Note: <strong>{submission.note}</strong>
          </>
        )}
        {teacher && " Make the changes, save, and submit again."}
      </Alert>
    );
  }
  return (
    <Alert tone="success">
      Published{submission.reviewedBy ? ` by ${submission.reviewedBy}` : ""}
      {submission.reviewedAt ? ` on ${formatDateTime(submission.reviewedAt)}` : ""}. Students can see these grades.
    </Alert>
  );
}

export function ReturnGradesModal({ open, selector, onClose, onReturned }: { open: boolean; selector: ClassSelector; onClose: () => void; onReturned: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Return grades to the teacher" size="md">
      {open && <ReturnGradesForm selector={selector} onClose={onClose} onReturned={onReturned} />}
    </Modal>
  );
}

function ReturnGradesForm({ selector, onClose, onReturned }: { selector: ClassSelector; onClose: () => void; onReturned: () => void }) {
  const toast = useToast();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!note.trim()) {
      setError("Tell the teacher what to change.");
      return;
    }
    setSaving(true);
    try {
      await gradeService.returnClass(selector, note.trim());
      toast.success("Returned to the teacher", "They can change the grades and submit again.");
      onReturned();
    } catch (returnError) {
      toast.error("Could not return the grades", getErrorMessage(returnError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Textarea
        label="Note for the teacher"
        required
        rows={4}
        maxLength={500}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        error={error}
        hint="Shown to the teacher (and emailed, if they allow it)."
      />
      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          Return grades
        </Button>
      </div>
    </form>
  );
}
