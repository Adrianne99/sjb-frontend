// Printable report card. Looks like an academic document on screen and on paper
// (see src/styles/print.css). No signatures or certification text are invented.
import { school } from "@/config/school";
import type { ReportCard } from "@/types";
import { formatDateTime, formatYearLevel } from "@/utils/format";
import { GRADE_REMARK_LABELS } from "@/utils/labels";

export function ReportCardDocument({ card }: { card: ReportCard }) {
  return (
    <article className="print-area mx-auto max-w-4xl overflow-hidden rounded-lg border border-border bg-surface shadow-sm" aria-label={`Report card, ${card.term.label}`}>
      {/* Letterhead */}
      <header className="flex items-center gap-4 border-b-4 border-gold-400 bg-primary-900 px-6 py-5 text-white sm:px-8">
        <img src={school.logo.src} alt={school.logo.alt} className="h-16 w-auto shrink-0 object-contain" />
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight font-semibold text-white sm:text-xl">{school.name}</p>
          <p className="text-sm text-primary-200">{school.location}</p>
        </div>
        <div className="ml-auto hidden text-right sm:block">
          <p className="font-display text-sm font-semibold tracking-wider text-gold-300 uppercase">Report Card</p>
          <p className="text-sm text-primary-100">{card.term.label}</p>
        </div>
      </header>

      <div className="px-6 py-6 sm:px-8">
        <p className="mb-4 font-display text-sm font-semibold tracking-wider text-gold-700 uppercase sm:hidden">Report Card · {card.term.label}</p>

        {card.includesDrafts && (
          <p className="mb-4 rounded-md border border-dashed border-warning-600 bg-warning-50 px-3 py-2 text-sm text-warning-700">
            Preview — includes DRAFT grades that students cannot see yet.
          </p>
        )}

        {/* Student identity */}
        <dl className="grid gap-x-8 gap-y-3 rounded-lg bg-surface-muted p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-muted">Student name</dt>
            <dd className="font-medium text-ink">{card.student.formalName}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Student number</dt>
            <dd className="font-medium text-ink tabular-nums">{card.student.studentNumber}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Program</dt>
            <dd className="font-medium text-ink">{card.student.programName}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Year level / Section</dt>
            <dd className="font-medium text-ink">
              {formatYearLevel(card.student.yearLevel)}
              {card.student.sectionName ? ` · ${card.student.sectionName}` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Academic year</dt>
            <dd className="font-medium text-ink">{card.term.academicYearName}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-muted">Term</dt>
            <dd className="font-medium text-ink">{card.term.semesterName}</dd>
          </div>
        </dl>

        {/* Grades */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <caption className="sr-only">Grades for {card.term.label}</caption>
            <thead>
              <tr className="bg-primary-50 text-left text-xs text-primary-900">
                <th scope="col" className="border border-border px-3 py-2 font-semibold">Code</th>
                <th scope="col" className="border border-border px-3 py-2 font-semibold">Subject</th>
                <th scope="col" className="border border-border px-3 py-2 text-center font-semibold">Units</th>
                <th scope="col" className="border border-border px-3 py-2 text-center font-semibold">Grade</th>
                <th scope="col" className="border border-border px-3 py-2 font-semibold">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {card.subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border border-border px-3 py-6 text-center text-ink-muted">
                    No grades published yet.
                  </td>
                </tr>
              ) : (
                card.subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="border border-border px-3 py-2 font-medium whitespace-nowrap">{subject.subjectCode}</td>
                    <td className="border border-border px-3 py-2">{subject.subjectName}</td>
                    <td className="border border-border px-3 py-2 text-center">{subject.units}</td>
                    <td className="border border-border px-3 py-2 text-center font-semibold tabular-nums">{subject.gradeDisplay ?? "—"}</td>
                    <td className="border border-border px-3 py-2">{GRADE_REMARK_LABELS[subject.remark]}</td>
                  </tr>
                ))
              )}
            </tbody>
            {card.subjects.length > 0 && (
              <tfoot>
                <tr className="bg-surface-muted font-semibold">
                  <td colSpan={2} className="border border-border px-3 py-2 text-right">
                    Total units / Weighted average
                  </td>
                  <td className="border border-border px-3 py-2 text-center">{card.totalUnits}</td>
                  <td className="border border-border px-3 py-2 text-center text-primary-900 tabular-nums">{card.averageDisplay ?? "—"}</td>
                  <td className="border border-border px-3 py-2 text-xs font-normal text-ink-muted">
                    {card.passedCount} passed · {card.failedCount} failed
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <footer className="mt-6 flex flex-col gap-1 border-t border-border pt-4 text-xs text-ink-muted sm:flex-row sm:justify-between">
          <p>Grading scale: {card.gradingScale}. Average excludes subjects marked Incomplete or Dropped.</p>
          <p>Generated {formatDateTime(card.generatedAt)}</p>
        </footer>
      </div>
    </article>
  );
}
