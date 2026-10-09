// Bell menu for staff and teachers: shows real items that need attention (no fake alerts).
import { Bell, ClipboardList, FileText, Undo2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { academicService } from "@/services/academic.service";
import { enrollmentService } from "@/services/enrollment.service";
import { gradeService } from "@/services/grade.service";
import { teachingService } from "@/services/teaching.service";

interface Counts {
  pendingEnrollments: number | null;
  draftGrades: number | null;
  /** Staff: classes teachers submitted for review. */
  submittedClasses: number | null;
  /** Teachers: their classes returned for changes. */
  returnedClasses: number | null;
}

export function NotificationsMenu() {
  const { can } = useAuth();
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState<Counts | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function load() {
    const term = await academicService.currentTerm().catch(() => null);
    const [pending, drafts, submitted, returned] = await Promise.all([
      can("enrollments:read") && term
        ? enrollmentService.list({ status: "PENDING", semesterId: term.id, pageSize: 1 }).then((result) => result.meta.total).catch(() => null)
        : null,
      can("grades:read") && term ? gradeService.list({ status: "DRAFT", semesterId: term.id, pageSize: 1 }).then((result) => result.meta.total).catch(() => null) : null,
      can("grades:publish") ? gradeService.pendingSubmissions().then((rows) => rows.length).catch(() => null) : null,
      can("teaching:own")
        ? teachingService.classes(term?.id).then((rows) => rows.filter((row) => row.submission?.status === "RETURNED").length).catch(() => null)
        : null,
    ]);
    setCounts({ pendingEnrollments: pending, draftGrades: drafts, submittedClasses: submitted, returnedClasses: returned });
  }

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setCounts(null);
      void load();
    }
  }

  // Close when clicking outside or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => !containerRef.current?.contains(event.target as Node) && setOpen(false);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = counts
    ? [
        counts.pendingEnrollments
          ? { icon: ClipboardList, text: `${counts.pendingEnrollments} pending enrollment(s) this term`, to: "/admin/enrollment?status=PENDING" }
          : null,
        counts.submittedClasses ? { icon: Upload, text: `${counts.submittedClasses} class(es) submitted by teachers, ready to publish`, to: "/admin/grades" } : null,
        counts.draftGrades ? { icon: FileText, text: `${counts.draftGrades} draft grade(s) not yet published`, to: "/admin/grades?draft=1" } : null,
        counts.returnedClasses ? { icon: Undo2, text: `${counts.returnedClasses} of your class(es) returned for changes`, to: "/admin/my-classes" } : null,
      ].filter((item) => item !== null)
    : [];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Notifications"
        className="flex size-10 items-center justify-center rounded-md text-ink-soft hover:bg-surface-muted hover:text-primary-800"
      >
        <Bell className="size-5" aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 animate-slide-up rounded-lg border border-border bg-surface shadow-lg">
          <p className="border-b border-border px-4 py-3 font-display text-sm font-semibold text-primary-900">Needs attention</p>
          {!counts ? (
            <div className="flex items-center gap-2 px-4 py-4 text-sm text-ink-muted">
              <Spinner size="sm" /> Checking...
            </div>
          ) : items.length === 0 ? (
            <p className="px-4 py-4 text-sm text-ink-muted">You're all caught up.</p>
          ) : (
            <ul className="py-1">
              {items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} onClick={() => setOpen(false)} className="flex items-start gap-3 px-4 py-3 text-sm hover:bg-surface-muted">
                    <item.icon className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                    <span className="text-ink-soft">{item.text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
