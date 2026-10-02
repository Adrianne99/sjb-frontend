// Subjects with grades and remarks (report cards and academic history).
import { StatusBadge } from "@/components/badge/StatusBadge";
import { DataTable } from "@/components/table/DataTable";
import type { SubjectGrade } from "@/types";

interface Props {
  subjects: SubjectGrade[];
  emptyTitle?: string;
  /** Staff view: also show Draft / Published. */
  showStatus?: boolean;
}

export function SubjectGradesTable({ subjects, emptyTitle = "No grades published yet.", showStatus = false }: Props) {
  return (
    <DataTable
      caption="Subjects and grades"
      rows={subjects}
      getRowKey={(row) => row.id}
      empty={{ title: emptyTitle, description: "Grades appear here once the school publishes them." }}
      columns={[
        { header: "Code", cell: (row) => <span className="font-medium text-primary-800">{row.subjectCode}</span>, hideOnMobile: true },
        {
          header: "Subject",
          primary: true,
          cell: (row) => (
            <div>
              <span className="md:hidden font-semibold text-primary-800">{row.subjectCode} · </span>
              {row.subjectName}
              {row.instructorName && <p className="text-xs text-ink-muted">{row.instructorName}</p>}
            </div>
          ),
        },
        { header: "Units", align: "center", cell: (row) => row.units },
        {
          header: "Grade",
          align: "center",
          cell: (row) => <span className="font-display text-base font-semibold text-primary-900 tabular-nums">{row.gradeDisplay ?? "—"}</span>,
        },
        { header: "Remarks", cell: (row) => <StatusBadge kind="remark" value={row.remark} /> },
        ...(showStatus ? [{ header: "Status", cell: (row: SubjectGrade) => <StatusBadge kind="grade" value={row.status} /> }] : []),
      ]}
    />
  );
}
