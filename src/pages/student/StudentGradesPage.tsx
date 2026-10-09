import { FileText } from "lucide-react";
import { AcademicHistoryView } from "@/components/grades/AcademicHistoryView";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalService } from "@/services/portal.service";

export default function StudentGradesPage() {
  useDocumentTitle("My Grades");
  const { data, loading, error, reload } = useApi(() => portalService.grades(), []);

  return (
    <>
      <PageHeader
        title="My Grades"
        description="Your academic history. Only grades published by the school are shown."
        actions={
          <ButtonLink to="/student/report-card" variant="primary" leftIcon={<FileText className="size-4" aria-hidden="true" />}>
            Report card
          </ButtonLink>
        }
      />
      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <LoadingState label="Loading grades..." />
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg border border-border bg-surface px-5 py-4">
            <div>
              <p className="text-xs text-ink-muted">General average (all published terms)</p>
              <p className="font-display text-2xl font-semibold text-primary-900 tabular-nums">{data.overallAverageDisplay ?? "—"}</p>
            </div>
            <p className="text-sm text-ink-muted">Grading scale: {data.gradingScale}</p>
          </div>
          <AcademicHistoryView history={data} />
        </>
      )}
    </>
  );
}
