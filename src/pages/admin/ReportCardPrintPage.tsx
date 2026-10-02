// Staff view of a student's report card for one term, ready to print.
import { Printer } from "lucide-react";
import { useParams } from "react-router";
import { Checkbox } from "@/components/form/Checkbox";
import { ReportCardDocument } from "@/components/report-card/ReportCardDocument";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useQueryState } from "@/hooks/useQueryState";
import { enrollmentService } from "@/services/enrollment.service";

export default function ReportCardPrintPage() {
  const enrollmentId = Number(useParams().id);
  const [query, setQuery] = useQueryState({ drafts: "" });
  const includeDrafts = query.drafts === "1";
  const { data, loading, error, reload } = useApi(() => enrollmentService.reportCard(enrollmentId, includeDrafts), [enrollmentId, includeDrafts]);
  useDocumentTitle(data ? `Report card — ${data.student.fullName}` : "Report card");

  return (
    <>
      <div className="no-print">
        <PageHeader
          title="Report card"
          breadcrumbs={[
            { label: "Students", to: "/admin/students" },
            ...(data ? [{ label: data.student.fullName, to: `/admin/students/${data.student.id}?tab=grades` }] : []),
            { label: "Report card" },
          ]}
          actions={
            <Button onClick={() => window.print()} leftIcon={<Printer className="size-4" aria-hidden="true" />} disabled={!data}>
              Print / Save as PDF
            </Button>
          }
        />
        <Checkbox
          className="mb-5"
          label="Preview with draft grades"
          description="Drafts are never shown to students. Uncheck to see exactly what the student sees."
          checked={includeDrafts}
          onChange={(event) => setQuery("drafts", event.target.checked ? "1" : "")}
        />
      </div>
      {error ? <ErrorState message={error} onRetry={reload} /> : loading || !data ? <LoadingState label="Loading report card..." /> : <ReportCardDocument card={data} />}
    </>
  );
}
