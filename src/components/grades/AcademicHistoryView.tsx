// Academic history: Academic Year -> Term (expandable) -> Subjects.
// Used by the student portal and the staff student record.
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card } from "@/components/card/Card";
import { EmptyState } from "@/components/ui/States";
import type { AcademicHistory, AcademicHistoryTerm } from "@/types";
import { cn } from "@/utils/cn";
import { formatYearLevel } from "@/utils/format";
import { SubjectGradesTable } from "./SubjectGradesTable";

interface ViewOptions {
  /** Staff view: show Draft / Published per grade. */
  showStatus?: boolean;
  /** Extra buttons inside each term, e.g. "Print report card". */
  renderTermActions?: (term: AcademicHistoryTerm) => ReactNode;
}

function TermPanel({ term, defaultOpen, showStatus, renderTermActions }: { term: AcademicHistoryTerm; defaultOpen: boolean } & ViewOptions) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `term-${term.enrollmentId}`;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <h4>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 bg-surface px-4 py-3 text-left hover:bg-surface-muted"
        >
          <span className="min-w-0 flex-1">
            <span className="block font-display font-semibold text-primary-900">
              {term.semesterName}
              {term.isCurrent && <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">Current</span>}
            </span>
            <span className="block text-xs text-ink-muted">
              {term.programCode} · {formatYearLevel(term.yearLevel)}
              {term.sectionName ? ` · ${term.sectionName}` : ""} · {term.subjects.length} subject(s)
            </span>
          </span>
          <span className="text-right">
            <span className="block text-xs text-ink-muted">Average</span>
            <span className="font-display text-lg font-semibold text-primary-900 tabular-nums">{term.averageDisplay ?? "—"}</span>
          </span>
          <StatusBadge kind="enrollment" value={term.enrollmentStatus} />
          <ChevronDown className={cn("size-5 text-ink-muted transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
      </h4>
      {open && (
        <div id={panelId} className="border-t border-border">
          {renderTermActions && <div className="flex flex-wrap gap-2 border-b border-border bg-surface-muted/50 px-4 py-2">{renderTermActions(term)}</div>}
          <SubjectGradesTable subjects={term.subjects} showStatus={showStatus} emptyTitle={showStatus ? "No grades encoded yet." : undefined} />
        </div>
      )}
    </div>
  );
}

export function AcademicHistoryView({ history, showStatus, renderTermActions }: { history: AcademicHistory } & ViewOptions) {
  if (history.years.length === 0) {
    return (
      <Card>
        <EmptyState title="No academic records yet." description="Terms and grades appear here after enrollment." />
      </Card>
    );
  }

  const firstWithGrades = history.years.flatMap((year) => year.terms).find((term) => term.subjects.length > 0)?.enrollmentId;

  return (
    <div className="space-y-8">
      {history.years.map((year) => (
        <section key={year.academicYearId} aria-labelledby={`ay-${year.academicYearId}`}>
          <h3 id={`ay-${year.academicYearId}`} className="mb-3 flex items-center gap-3 text-lg font-semibold">
            <span aria-hidden="true" className="h-5 w-1 rounded bg-gold-400" />
            A.Y. {year.academicYearName}
          </h3>
          <div className="space-y-3">
            {[...year.terms]
              .sort((a, b) => a.termNumber - b.termNumber)
              .map((term) => (
                <TermPanel key={term.enrollmentId} term={term} defaultOpen={term.enrollmentId === firstWithGrades} showStatus={showStatus} renderTermActions={renderTermActions} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
