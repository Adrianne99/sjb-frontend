// Student overview: identity, current term, and the four things students check most.
import { ArrowRight, CalendarDays, CircleCheck, FileText, GraduationCap, Info, Megaphone, TriangleAlert, Wallet } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { AnnouncementCard } from "@/components/landing/AnnouncementCard";
import { Modal } from "@/components/modal/Modal";
import { Button } from "@/components/ui/Button";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { portalService } from "@/services/portal.service";
import { cn } from "@/utils/cn";
import { classLocation, formatMoney, formatTimeRange, formatYearLevel, isPositiveAmount } from "@/utils/format";
import { DAY_LABELS } from "@/utils/labels";

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", hour: "numeric", hourCycle: "h23" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function SummaryTile({ to, icon: Icon, label, children, accent }: { to: string; icon: typeof Wallet; label: string; children: ReactNode; accent?: boolean }) {
  return (
    <Link to={to} className="group flex flex-col rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className={cn("flex size-10 items-center justify-center rounded-lg", accent ? "bg-gold-50 text-gold-700" : "bg-primary-50 text-primary-700")}>
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <ArrowRight className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </div>
      <p className="mt-4 text-sm font-medium text-ink-muted">{label}</p>
      <div className="mt-1">{children}</div>
    </Link>
  );
}

export default function StudentDashboardPage() {
  useDocumentTitle("Dashboard");
  const { data, loading, error, reload } = useApi(() => portalService.overview(), []);
  const [showAll, setShowAll] = useState(false);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading || !data) {
    return (
      <div className="space-y-6" role="status" aria-label="Loading your dashboard">
        <div className="h-36 animate-pulse rounded-xl bg-primary-900/90" />
        <SkeletonCards />
      </div>
    );
  }

  const { student, currentTerm, currentEnrollment, nextClass, academicStatus } = data;
  const firstName = student.firstName.split(" ")[0];
  const StatusIcon = academicStatus.tone === "success" ? CircleCheck : academicStatus.tone === "warning" ? TriangleAlert : Info;

  return (
    <div className="space-y-6">
      {/* Identity banner */}
      <section className="relative overflow-hidden rounded-xl bg-primary-900 px-5 py-6 text-white sm:px-8 sm:py-8">
        <div aria-hidden="true" className="absolute -top-16 -right-10 size-56 rounded-full bg-primary-700/50 blur-2xl" />
        <div className="relative">
          <p className="text-sm text-primary-200">{greeting()},</p>
          <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">{firstName}</h1>
          <p className="mt-2 text-sm text-primary-100">
            <span className="tabular-nums">{student.studentNumber}</span> · {student.programName}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            {currentTerm && <span className="rounded-full bg-white/10 px-3 py-1 text-primary-50">{currentTerm.label}</span>}
            {currentEnrollment ? (
              <>
                <span className="rounded-full bg-white/10 px-3 py-1 text-primary-50">
                  {formatYearLevel(currentEnrollment.yearLevel)}
                  {currentEnrollment.sectionName ? ` · ${currentEnrollment.sectionName}` : ""}
                </span>
                <span className="rounded-full bg-surface px-1 py-0.5">
                  <StatusBadge kind="enrollment" value={currentEnrollment.status} />
                </span>
              </>
            ) : (
              <span className="rounded-full bg-white/10 px-3 py-1 text-primary-50">Not enrolled this term</span>
            )}
          </div>
        </div>
      </section>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile to="/student/grades" icon={GraduationCap} label={data.currentTermAverage ? "Current term average" : "General average"} accent>
          <p className="font-display text-2xl font-semibold text-primary-900 tabular-nums">{data.currentTermAverage ?? data.overallAverage ?? "—"}</p>
          <p className="mt-1 text-xs text-ink-muted">{data.currentTermAverage || data.overallAverage ? `Scale: ${data.gradingScale}` : "No published grades yet"}</p>
        </SummaryTile>

        <SummaryTile to="/student/balance" icon={Wallet} label="Current balance">
          <p className={cn("font-display text-2xl font-semibold tabular-nums", isPositiveAmount(data.balance.balance) ? "text-primary-900" : "text-success-700")}>
            {formatMoney(data.balance.balance)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {formatMoney(data.balance.totalPaid)} paid of {formatMoney(data.balance.totalAssessed)}
          </p>
        </SummaryTile>

        <SummaryTile to="/student/schedule" icon={CalendarDays} label={nextClass?.isOngoing ? "Class in progress" : "Next class"}>
          {nextClass ? (
            <>
              <p className="font-display text-base font-semibold text-primary-900">
                {nextClass.subject.code} <span className="font-normal text-ink-soft">· {classLocation(nextClass)}</span>
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {nextClass.isToday ? "Today" : DAY_LABELS[nextClass.dayOfWeek]}, {formatTimeRange(nextClass.startTime, nextClass.endTime)}
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-muted">No schedule assigned.</p>
          )}
        </SummaryTile>

        <SummaryTile to="/student/report-card" icon={FileText} label="Academic status">
          <p
            className={cn(
              "flex items-start gap-1.5 text-sm font-medium",
              academicStatus.tone === "success" ? "text-success-700" : academicStatus.tone === "warning" ? "text-warning-700" : "text-ink-soft",
            )}
          >
            <StatusIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {academicStatus.label}
          </p>
        </SummaryTile>
      </div>

      {/* Announcements */}
      <Card>
        <CardHeader
          title="Announcements"
          icon={<Megaphone className="size-5" aria-hidden="true" />}
          actions={
            data.announcements.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setShowAll(true)}>
                View all
              </Button>
            )
          }
        />
        <CardBody>
          {data.announcements.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements available." />
          ) : (
            <ul className="grid gap-4 md:grid-cols-3">
              {data.announcements.map((announcement) => (
                <li key={announcement.id}>
                  <AnnouncementCard announcement={announcement} compact />
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <AllAnnouncementsModal open={showAll} onClose={() => setShowAll(false)} />
    </div>
  );
}

function AllAnnouncementsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="All announcements" size="lg">
      {open && <AnnouncementList />}
    </Modal>
  );
}

function AnnouncementList() {
  const { data, loading, error } = useApi(() => portalService.announcements(), []);
  if (loading) return <LoadingState label="Loading announcements..." />;
  if (error) return <ErrorState message={error} />;
  if (!data?.length) return <EmptyState title="No announcements available." />;
  return (
    <ul className="space-y-3">
      {data.map((announcement) => (
        <li key={announcement.id}>
          <AnnouncementCard announcement={announcement} compact />
        </li>
      ))}
    </ul>
  );
}
