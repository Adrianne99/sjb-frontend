import { FileText } from "lucide-react";
import { useState } from "react";
import { Select } from "@/components/form/Select";
import { ReportCardDocument } from "@/components/report-card/ReportCardDocument";
import { Card } from "@/components/card/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalService } from "@/services/portal.service";

export default function StudentReportCardPage() {
  useDocumentTitle("Report Card");
  const [semesterId, setSemesterId] = useState<number | undefined>(undefined);
  const { data, loading, error, reload } = useApi(() => portalService.reportCard(semesterId), [semesterId]);

  return (
    // Same centered width as the report card, so the term picker lines up with its left edge.
    <div className="mx-auto max-w-4xl print:max-w-none">
      <div className="no-print">
        {data && data.availableTerms.length > 1 && (
          <Select
            label="Term"
            className="mb-6 max-w-xs"
            value={String(semesterId ?? data.reportCard?.term.semesterId ?? "")}
            onChange={(event) => setSemesterId(Number(event.target.value))}
            options={data.availableTerms.map((term) => ({ value: String(term.semesterId), label: term.label }))}
          />
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading && !data ? (
        <LoadingState label="Loading report card..." />
      ) : !data?.reportCard ? (
        <Card>
          <EmptyState icon={FileText} title="No grades published yet." description="Your report card will be available once the school publishes your grades." />
        </Card>
      ) : (
        <ReportCardDocument card={data.reportCard} />
      )}
    </div>
  );
}
