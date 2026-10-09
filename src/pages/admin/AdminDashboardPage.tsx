// Office dashboard (admin, staff, registrar, cashier). All numbers come live
// from the database. Each card only appears when the user's role may see it —
// e.g. a cashier sees payments, a registrar sees enrollment.
import { CalendarClock, ClipboardList, GraduationCap, History, Receipt, UserCheck, Users, Wallet } from "lucide-react";
import { Link } from "react-router";
import { StatusBadge } from "@/components/badge/StatusBadge";
import { Card, CardBody, CardHeader } from "@/components/card/Card";
import { StatCard } from "@/components/card/StatCard";
import { BarChart } from "@/components/charts/BarChart";
import { PageHeader } from "@/components/ui/PageHeader";
import { SkeletonCards } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { reportService } from "@/services/admin.service";
import { TeacherDashboard } from "./TeacherDashboard";
import { classLocation, formatDate, formatDateTime, formatMoney, formatMonth, formatTimeRange, formatYearLevel } from "@/utils/format";

export default function AdminDashboardPage() {
  useDocumentTitle("Dashboard");
  const { can } = useAuth();
  // Teachers get their own dashboard (their classes); everyone else the office one.
  return can("teaching:own") ? <TeacherDashboard /> : <OfficeDashboard />;
}

function OfficeDashboard() {
  const { user, can } = useAuth();
  const { data, loading, error, reload } = useApi(() => reportService.dashboard(), []);

  return (
    <>
      <PageHeader title={`Welcome, ${user?.displayName ?? ""}`} description={data?.currentTerm ? `Current term: ${data.currentTerm.label}` : "School overview"} />

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !data ? (
        <SkeletonCards />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.stats.totalStudents !== null && (
              <StatCard label="Total students" value={data.stats.totalStudents.toLocaleString()} icon={Users} hint="Active student records" to="/admin/students" />
            )}
            {data.stats.currentlyEnrolled !== null && (
              <StatCard label="Currently enrolled" value={data.stats.currentlyEnrolled.toLocaleString()} icon={UserCheck} hint="This term" to="/admin/enrollment?status=ENROLLED" />
            )}
            {data.stats.pendingEnrollment !== null && (
              <StatCard
                label="Pending enrollment"
                value={data.stats.pendingEnrollment.toLocaleString()}
                icon={ClipboardList}
                accent="warning"
                hint="Awaiting completion"
                to="/admin/enrollment?status=PENDING"
              />
            )}
            {data.stats.outstandingTotal !== null && (
              <StatCard
                label="Outstanding balances"
                value={formatMoney(data.stats.outstandingTotal)}
                icon={Wallet}
                accent="gold"
                hint={`${data.stats.studentsWithBalance ?? 0} student(s) with a balance`}
                to={can("reports:read") ? "/admin/reports?tab=outstanding" : "/admin/payments"}
              />
            )}
          </div>

          {/* One grid, so the cards a role can see fill the rows without gaps. */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {can("enrollments:read") && (
              <Card>
                <CardHeader title="Enrollment by year level" description="Enrolled and pending, current term" />
                <CardBody>
                  {data.enrollmentByYearLevel.length === 0 ? (
                    <EmptyState title="No enrollments this term yet." />
                  ) : (
                    <BarChart
                      title="Enrollment by year level"
                      valueLabel="Students"
                      orientation="horizontal"
                      data={data.enrollmentByYearLevel.map((row) => ({ label: formatYearLevel(row.yearLevel), value: row.count, display: `${row.count} students` }))}
                    />
                  )}
                </CardBody>
              </Card>
            )}
            {can("payments:read") && (
              <Card>
                <CardHeader title="Payment collections" description="Recorded payments, last 6 months (voided payments excluded)" />
                <CardBody>
                  <BarChart
                    title="Payment collections per month"
                    valueLabel="Amount collected"
                    data={data.collectionsByMonth.map((row) => ({ label: formatMonth(row.month), value: Number(row.total), display: formatMoney(row.total) }))}
                  />
                </CardBody>
              </Card>
            )}

            {can("enrollments:read") && (
              <Card>
                <CardHeader title="Recent enrollments" icon={<ClipboardList className="size-5" aria-hidden="true" />} actions={<Link to="/admin/enrollment" className="text-sm font-medium text-primary-700 hover:underline">View all</Link>} />
                {data.recentEnrollments.length === 0 ? (
                  <EmptyState title="No enrollments yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.recentEnrollments.map((enrollment) => (
                      <li key={enrollment.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <Link to={`/admin/students/${enrollment.studentId}`} className="truncate text-sm font-medium text-ink hover:text-primary-700 hover:underline">
                            {enrollment.student?.formalName}
                          </Link>
                          <p className="text-xs text-ink-muted">
                            {enrollment.programCode} {enrollment.yearLevel} · {formatDate(enrollment.enrollmentDate)}
                          </p>
                        </div>
                        <StatusBadge kind="enrollment" value={enrollment.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {can("payments:read") && (
              <Card>
                <CardHeader title="Recent payments" icon={<Receipt className="size-5" aria-hidden="true" />} actions={<Link to="/admin/payments" className="text-sm font-medium text-primary-700 hover:underline">View all</Link>} />
                {data.recentPayments.length === 0 ? (
                  <EmptyState title="No payment records found." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.recentPayments.map((payment) => (
                      <li key={payment.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{payment.student.formalName}</p>
                          <p className="text-xs text-ink-muted">
                            {payment.referenceNumber} · {formatDate(payment.paymentDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold tabular-nums ${payment.status === "VOIDED" ? "text-ink-muted line-through" : "text-primary-900"}`}>{formatMoney(payment.amount)}</p>
                          {payment.status === "VOIDED" && <StatusBadge kind="payment" value="VOIDED" />}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {can("grades:read") && (
              <Card>
                <CardHeader title="Recent grade updates" icon={<GraduationCap className="size-5" aria-hidden="true" />} actions={<Link to="/admin/grades" className="text-sm font-medium text-primary-700 hover:underline">Grades</Link>} />
                {data.recentGradeUpdates.length === 0 ? (
                  <EmptyState title="No grades encoded yet." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.recentGradeUpdates.map((grade) => (
                      <li key={grade.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {grade.subject.code} · {grade.student.formalName}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {grade.gradeDisplay ?? grade.remark} · by {grade.encodedBy} · {formatDateTime(grade.updatedAt)}
                          </p>
                        </div>
                        <StatusBadge kind="grade" value={grade.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}

            {can("schedules:read") && (
              <Card>
                <CardHeader title="Upcoming classes today" icon={<CalendarClock className="size-5" aria-hidden="true" />} actions={<Link to="/admin/schedules" className="text-sm font-medium text-primary-700 hover:underline">Schedules</Link>} />
                {data.upcomingClasses.length === 0 ? (
                  <EmptyState title="No more classes today." />
                ) : (
                  <ul className="divide-y divide-border">
                    {data.upcomingClasses.map((slot) => (
                      <li key={slot.id} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {slot.subject.code} · {slot.section.name}
                          </p>
                          <p className="text-xs text-ink-muted">
                            {slot.instructor.fullName} · {classLocation(slot)}
                          </p>
                        </div>
                        <p className="text-sm whitespace-nowrap text-ink-soft tabular-nums">{formatTimeRange(slot.startTime, slot.endTime)}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>

          {can("audit:read") && (
            <Card>
              <CardHeader title="Recent system activity" icon={<History className="size-5" aria-hidden="true" />} actions={<Link to="/admin/audit-logs" className="text-sm font-medium text-primary-700 hover:underline">Audit logs</Link>} />
              {data.recentActivity.length === 0 ? (
                <EmptyState title="No activity recorded yet." />
              ) : (
                <ul className="divide-y divide-border">
                  {data.recentActivity.map((log) => (
                    <li key={log.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-ink">
                        <span className="font-medium">{log.user?.username ?? "System"}</span> — {log.description}
                      </p>
                      <time dateTime={log.createdAt} className="shrink-0 text-xs text-ink-muted">
                        {formatDateTime(log.createdAt)}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}
        </div>
      )}
    </>
  );
}
