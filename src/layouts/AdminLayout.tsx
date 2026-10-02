// Admin / staff portal: navy sidebar (desktop) or slide-in drawer (tablet/phone),
// top bar with student search, notifications and the current user.
import { Menu, Search } from "lucide-react";
import { Suspense, useCallback, useState, type FormEvent } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { NotificationsMenu } from "@/components/navbar/NotificationsMenu";
import { MobileDrawer } from "@/components/sidebar/MobileDrawer";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { Badge } from "@/components/badge/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingState } from "@/components/ui/States";
import { ADMIN_NAV } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AdminLayout() {
  const { pathname } = useLocation();
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!search.trim()) return;
    navigate(`/admin/students?search=${encodeURIComponent(search.trim())}`);
    setSearch("");
  }

  const sidebar = (
    <Sidebar groups={ADMIN_NAV} tone="navy" homePath="/admin" subtitle="Administration" onNavigate={closeDrawer} onLogout={handleLogout} />
  );

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
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6 no-print">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="flex size-10 items-center justify-center rounded-md text-primary-900 hover:bg-surface-muted lg:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          {can("students:read") && (
            <form onSubmit={handleSearch} role="search" className="relative max-w-md flex-1">
              <label htmlFor="global-search" className="sr-only">
                Search students
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                id="global-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students by ID or name..."
                className="h-10 w-full rounded-md border border-border bg-surface-muted pr-3 pl-9 text-sm placeholder:text-ink-muted focus:border-primary-500 focus:bg-surface focus:ring-2 focus:ring-primary-100 focus:outline-none"
              />
            </form>
          )}

          <div className="ml-auto flex items-center gap-2">
            <NotificationsMenu />
            {user && (
              <div className="hidden items-center gap-3 border-l border-border pl-3 sm:flex">
                <div className="text-right leading-tight">
                  <p className="text-sm font-medium text-ink">{user.displayName}</p>
                  <Badge tone={user.role === "ADMIN" ? "gold" : "info"} className="mt-0.5">
                    {user.role === "ADMIN" ? "Administrator" : "Staff"}
                  </Badge>
                </div>
                <Avatar name={user.displayName} size="sm" />
              </div>
            )}
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingState label="Loading page..." />}>
            {/* Soft fade each time the page changes (key = the page address). */}
          <div key={pathname} className="animate-page-in">
            <Outlet />
          </div>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
