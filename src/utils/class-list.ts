// Class list rows for printing (components/admin/ClassListExport.tsx) and the
// spreadsheet download (.csv, opens in Excel).
import type { ClassRoster } from "@/types";

const REMARK_LABELS: Record<string, string> = { PASSED: "Passed", FAILED: "Failed", INCOMPLETE: "Incomplete", DROPPED: "Dropped" };
const STATUS_LABELS: Record<string, string> = { DRAFT: "Draft", PUBLISHED: "Published" };

/** One row per student: what both the printout and the spreadsheet show. */
export function exportRows(roster: ClassRoster) {
  return roster.students.map((row, index) => ({
    number: index + 1,
    studentNumber: row.student.studentNumber,
    name: row.student.formalName,
    note: row.irregular ? `Irregular (${row.homeSectionName ?? "no section"})` : "",
    grade: row.grade?.gradeDisplay ?? "",
    remark: row.grade ? (REMARK_LABELS[row.grade.remark] ?? row.grade.remark) : "",
    status: row.grade ? (STATUS_LABELS[row.grade.status] ?? row.grade.status) : "Not encoded",
  }));
}

/** Puts a value in quotes when needed, so commas or quotes in names don't break the file. */
function csvCell(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Downloads the class list as e.g. "IT101_IT-1-A_grades.csv". */
export function downloadClassCsv(roster: ClassRoster) {
  const header = ["#", "Student number", "Name", "Note", "Grade", "Remarks", "Status"];
  const lines = [header, ...exportRows(roster).map((row) => [row.number, row.studentNumber, row.name, row.note, row.grade, row.remark, row.status])].map((cells) =>
    cells.map(csvCell).join(","),
  );
  // A "byte order mark" at the start tells Excel the file is UTF-8 (so names like "Peña" show correctly).
  const byteOrderMark = String.fromCharCode(0xfeff);
  const blob = new Blob([byteOrderMark + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${roster.class.subject.code}_${roster.class.section.name.replace(/\s+/g, "-")}_grades.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
