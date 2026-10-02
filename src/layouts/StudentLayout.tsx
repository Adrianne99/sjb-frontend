// Student portal: calm white sidebar on desktop; compact top bar + bottom
// navigation on phones (grades, schedule, balance and profile are one tap away).
import { LogOut, Menu } from "lucide-react";
import { Suspense, useCallback, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import { MobileDrawer } from "@/components/sidebar/MobileDrawer";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Logo } from "@/components/ui/Logo";
import { LoadingState } from "@/components/ui/States";
import { STUDENT_BOTTOM_NAV, STUDENT_NAV } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

export function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const sidebar = <Sidebar groups={STUDENT_NAV} tone="light" homePath="/student" subtitle="Student Portal" onNavigate={closeDrawer} onLogout={handleLogout} />;

  return (
    <div className="min-h-dvh bg-background">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2">
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block no-print">{sidebar}</aside>
      <MobileDrawer open={drawerOpen} onClose={closeDrawer}>
        {sidebar}
      </MobileDrawer>

      <div className="lg:pl-64">
        {/* Phone / tablet top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur lg:hidden no-print">
          <Logo variant="mark" size="sm" to="/student" />
          <p className="min-w-0 flex-1 truncate font-display text-sm font-semibold text-primary-900">Student Portal</p>
          <button type="button" onClick={handleLogout} aria-label="Log out" className="flex size-10 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted">
            <LogOut className="size-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="flex size-10 items-center justify-center rounded-md text-primary-900 hover:bg-surface-muted">
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </header>

        {/* Desktop top bar */}
        <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-border bg-surface/95 px-8 backdrop-blur lg:flex no-print">
          <p className="text-sm text-ink-muted">
            Welcome, <span className="font-medium text-ink">{user?.displayName}</span>
          </p>
          <p className="text-sm text-ink-muted">
            Student No. <span className="font-medium text-primary-900 tabular-nums">{user?.studentNumber}</span>
          </p>
        </header>

        <main id="main" className="mx-auto w-full max-w-6xl px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-10">
          <Suspense fallback={<LoadingState label="Loading..." />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      {/* Phone bottom navigation */}
      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden no-print">
        <ul className="grid grid-cols-5">
          {STUDENT_BOTTOM_NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn("flex min-h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-medium", isActive ? "text-primary-800" : "text-ink-muted")
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", isActive && "bg-gold-100")}>
                      <item.icon className="size-5" aria-hidden="true" />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
