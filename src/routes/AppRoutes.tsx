// All pages of the app. Portal pages are lazy-loaded so the public website
// stays small and fast.
//
// Route guards here are for USER EXPERIENCE only. The backend checks
// authentication and permissions on every API request.
import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AdminLayout } from "@/layouts/AdminLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import ChangePasswordPage from "@/pages/auth/ChangePasswordPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import LoginPage from "@/pages/auth/LoginPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import HomePage from "@/pages/landing/HomePage";
import { AnnouncementsPage, LegalPage } from "@/pages/landing/InfoPages";
import NotFoundPage from "@/pages/NotFoundPage";
import { OFFICE_ROLES } from "@/config/roles";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";

// Student portal
const StudentDashboardPage = lazy(() => import("@/pages/student/StudentDashboardPage"));
const StudentGradesPage = lazy(() => import("@/pages/student/StudentGradesPage"));
const StudentReportCardPage = lazy(() => import("@/pages/student/StudentReportCardPage"));
const StudentSchedulePage = lazy(() => import("@/pages/student/StudentSchedulePage"));
const StudentBalancePage = lazy(() => import("@/pages/student/StudentBalancePage"));
const StudentProfilePage = lazy(() => import("@/pages/student/StudentProfilePage"));
const StudentSettingsPage = lazy(() => import("@/pages/student/StudentSettingsPage"));

// Admin / staff portal
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const StudentsPage = lazy(() => import("@/pages/admin/students/StudentsPage"));
const StudentFormPage = lazy(() => import("@/pages/admin/students/StudentFormPage"));
const StudentDetailPage = lazy(() => import("@/pages/admin/students/StudentDetailPage"));
const EnrollmentPage = lazy(() => import("@/pages/admin/EnrollmentPage"));
const RequirementsPage = lazy(() => import("@/pages/admin/RequirementsPage"));
const ApplicationsPage = lazy(() => import("@/pages/admin/ApplicationsPage"));
const ApplyPage = lazy(() => import("@/pages/landing/ApplyPage"));
const AnnouncementDetailPage = lazy(() => import("@/pages/landing/AnnouncementDetailPage"));
const GradesPage = lazy(() => import("@/pages/admin/GradesPage"));
const AccountPage = lazy(() => import("@/pages/admin/AccountPage"));
const SchedulesPage = lazy(() => import("@/pages/admin/SchedulesPage"));
const PaymentsPage = lazy(() => import("@/pages/admin/PaymentsPage"));
const ReportsPage = lazy(() => import("@/pages/admin/ReportsPage"));
const AnnouncementsAdminPage = lazy(() => import("@/pages/admin/AnnouncementsAdminPage"));
const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const AuditLogsPage = lazy(() => import("@/pages/admin/AuditLogsPage"));
const SettingsPage = lazy(() => import("@/pages/admin/settings/SettingsPage"));
const ReportCardPrintPage = lazy(() => import("@/pages/admin/ReportCardPrintPage"));

export function AppRoutes() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        {/* About, Academics, Admissions and Contact are sections of the landing
            page now. The old addresses (e.g. /about) slide to that section. */}
        {["about", "academics", "admissions", "contact"].map((section) => (
          <Route key={section} path={section} element={<Navigate to={{ pathname: "/", hash: section }} replace />} />
        ))}
        {/* Announcements is the only separate page ("Show all announcements"). */}
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
        {/* "Enroll Now" — online pre-registration form */}
        <Route path="apply" element={<ApplyPage />} />
        <Route path="privacy" element={<LegalPage kind="privacy" />} />
        <Route path="terms" element={<LegalPage kind="terms" />} />
      </Route>

      {/* Authentication */}
      <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password" element={<ResetPasswordPage />} />

      {/* Logged-in users */}
      <Route element={<ProtectedRoute />}>
        <Route path="change-password" element={<ChangePasswordPage />} />

        <Route element={<RoleRoute roles={["STUDENT"]} />}>
          <Route path="student" element={<StudentLayout />}>
            <Route index element={<StudentDashboardPage />} />
            <Route path="grades" element={<StudentGradesPage />} />
            <Route path="report-card" element={<StudentReportCardPage />} />
            <Route path="schedule" element={<StudentSchedulePage />} />
            <Route path="balance" element={<StudentBalancePage />} />
            <Route path="profile" element={<StudentProfilePage />} />
            <Route path="settings" element={<StudentSettingsPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute roles={OFFICE_ROLES} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />

            <Route element={<RoleRoute permission="students:read" />}>
              <Route path="students" element={<StudentsPage />} />
              <Route path="students/new" element={<StudentFormPage />} />
              <Route path="students/:id" element={<StudentDetailPage />} />
              <Route path="students/:id/edit" element={<StudentFormPage />} />
            </Route>
            <Route element={<RoleRoute permission="requirements:read" />}>
              <Route path="requirements" element={<RequirementsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
            </Route>
            <Route element={<RoleRoute permission="enrollments:read" />}>
              <Route path="enrollment" element={<EnrollmentPage />} />
            </Route>
            <Route element={<RoleRoute permission="account:self" />}>
              <Route path="account" element={<AccountPage />} />
            </Route>
            <Route element={<RoleRoute permission="teaching:own" />}>
              <Route path="my-classes" element={<GradesPage teacher />} />
            </Route>
            <Route element={<RoleRoute permission="grades:read" />}>
              <Route path="grades" element={<GradesPage />} />
              <Route path="enrollments/:id/report-card" element={<ReportCardPrintPage />} />
            </Route>
            <Route element={<RoleRoute permission="schedules:read" />}>
              <Route path="schedules" element={<SchedulesPage />} />
            </Route>
            <Route element={<RoleRoute permission="payments:read" />}>
              <Route path="payments" element={<PaymentsPage />} />
            </Route>
            <Route element={<RoleRoute permission="reports:read" />}>
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route element={<RoleRoute permission="announcements:manage" />}>
              <Route path="announcements" element={<AnnouncementsAdminPage />} />
            </Route>
            <Route element={<RoleRoute permission="users:manage" />}>
              <Route path="users" element={<UsersPage />} />
            </Route>
            <Route element={<RoleRoute permission="audit:read" />}>
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>
            <Route element={<RoleRoute permission="settings:manage" />}>
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
