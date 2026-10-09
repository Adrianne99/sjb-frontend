// Printable class list with grades (Grades page and My Classes). Only visible on
// paper (class "print-only"), with the school header and signature lines.
// The spreadsheet download is in utils/class-list.ts.
import { school } from "@/config/school";
import type { ClassRoster } from "@/types";
import { exportRows } from "@/utils/class-list";
import { formatDate } from "@/utils/format";

export function PrintableClassList({ roster }: { roster: ClassRoster }) {
  const { class: info } = roster;
  return (
    <div className="print-only text-[11pt] text-black">
      <div className="flex items-center gap-4 border-b-2 border-black pb-3">
        <img src={school.logo.src} alt="" className="h-16 w-auto" />
        <div>
          <p className="text-lg font-bold">{school.name}</p>
          <p className="text-sm">{school.location}</p>
        </div>
      </div>
      <h1 className="mt-4 text-base font-bold uppercase">Class list and grades</h1>
      <table className="mt-2 text-sm">
        <tbody>
          <tr>
            <td className="pr-4 font-semibold">Subject</td>
            <td>
              {info.subject.code} — {info.subject.name} ({info.subject.units} units)
            </td>
          </tr>
          <tr>
            <td className="pr-4 font-semibold">Section</td>
            <td>{info.section.name}</td>
          </tr>
          <tr>
            <td className="pr-4 font-semibold">Instructor</td>
            <td>{info.instructor.fullName}</td>
          </tr>
          <tr>
            <td className="pr-4 font-semibold">Term</td>
            <td>{info.termLabel}</td>
          </tr>
        </tbody>
      </table>

      <table className="mt-4 w-full border-collapse text-sm">
        <thead>
          <tr>
            {["#", "Student no.", "Name", "Grade", "Remarks", "Status"].map((heading) => (
              <th key={heading} className="border border-black px-2 py-1 text-left">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exportRows(roster).map((row) => (
            <tr key={row.number}>
              <td className="border border-black px-2 py-1">{row.number}</td>
              <td className="border border-black px-2 py-1">{row.studentNumber}</td>
              <td className="border border-black px-2 py-1">
                {row.name}
                {row.note && <span className="text-xs"> · {row.note}</span>}
              </td>
              <td className="border border-black px-2 py-1">{row.grade}</td>
              <td className="border border-black px-2 py-1">{row.remark}</td>
              <td className="border border-black px-2 py-1">{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
        <div>
          <div className="border-t border-black pt-1">Instructor's signature</div>
        </div>
        <div>
          <div className="border-t border-black pt-1">Registrar's signature</div>
        </div>
      </div>
      <p className="mt-6 text-xs">Printed {formatDate(new Date().toISOString())}. Draft grades are not final until published.</p>
    </div>
  );
}
