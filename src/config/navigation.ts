// Sidebar / menu items. Items with a `permission` only appear for users who
// have it (the backend still checks every request).
import {
  BookOpen,
  CalendarDays,
  CircleUserRound,
  ChartColumn,
  ClipboardList,
  FileCheck2,
  FileText,
  GraduationCap,
  House,
  Inbox,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Settings,
  UserCog,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/types";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  permission?: Permission;
  /** Only "active" on an exact URL match (for dashboard links). */
  end?: boolean;
}

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const ADMIN_NAV: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
      { label: "My Classes", to: "/admin/my-classes", icon: BookOpen, permission: "teaching:own" },
      { label: "Students", to: "/admin/students", icon: Users, permission: "students:read" },
      { label: "Applications", to: "/admin/applications", icon: Inbox, permission: "applications:read" },
      { label: "Requirements", to: "/admin/requirements", icon: FileCheck2, permission: "requirements:read" },
      { label: "Enrollment", to: "/admin/enrollment", icon: ClipboardList, permission: "enrollments:read" },
      { label: "Grades", to: "/admin/grades", icon: GraduationCap, permission: "grades:read" },
      { label: "Schedules", to: "/admin/schedules", icon: CalendarDays, permission: "schedules:read" },
      { label: "Payments", to: "/admin/payments", icon: Wallet, permission: "payments:read" },
      { label: "Reports", to: "/admin/reports", icon: ChartColumn, permission: "reports:read" },
      { label: "Announcements", to: "/admin/announcements", icon: Megaphone, permission: "announcements:manage" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "User Accounts", to: "/admin/users", icon: UserCog, permission: "users:manage" },
      { label: "Audit Logs", to: "/admin/audit-logs", icon: ScrollText, permission: "audit:read" },
      { label: "Settings", to: "/admin/settings", icon: Settings, permission: "settings:manage" },
    ],
  },
  {
    title: "Account",
    items: [{ label: "My Account", to: "/admin/account", icon: CircleUserRound, permission: "account:self" }],
  },
];

export const STUDENT_NAV: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", to: "/student", icon: House, end: true },
      { label: "My Grades", to: "/student/grades", icon: GraduationCap },
      { label: "Report Card", to: "/student/report-card", icon: FileText },
      { label: "My Schedule", to: "/student/schedule", icon: CalendarDays },
      { label: "Balance & Payments", to: "/student/balance", icon: Wallet },
      { label: "My Profile", to: "/student/profile", icon: UserRound },
      { label: "Settings", to: "/student/settings", icon: Settings },
    ],
  },
];

/** The 5 most-used student pages, shown in the phone bottom bar. */
export const STUDENT_BOTTOM_NAV: NavItem[] = [
  { label: "Home", to: "/student", icon: House, end: true },
  { label: "Grades", to: "/student/grades", icon: GraduationCap },
  { label: "Schedule", to: "/student/schedule", icon: CalendarDays },
  { label: "Balance", to: "/student/balance", icon: Wallet },
  { label: "Profile", to: "/student/profile", icon: UserRound },
];

/**
 * Public website menu. Most items slide to a section of the landing page
 * ("/#about" -> the section with id="about"). Announcements is its own page.
 * `section` = the landing-page section that highlights this item while it is on screen.
 */
export const PUBLIC_NAV = [
  { label: "Home", to: "/#home", section: "home" },
  { label: "About", to: "/#about", section: "about" },
  { label: "Academics", to: "/#academics", section: "academics" },
  { label: "Admissions", to: "/#admissions", section: "admissions" },
  { label: "Announcements", to: "/announcements", section: "announcements" },
  { label: "Contact", to: "/#contact", section: "contact" },
];
