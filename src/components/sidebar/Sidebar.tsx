// Sidebar navigation used by both portals.
// tone="navy" (admin) or tone="light" (student portal, calmer look).
import { LogOut } from "lucide-react";
import { NavLink } from "react-router";
import { Badge } from "@/components/badge/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import type { NavGroup } from "@/config/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";

interface SidebarProps {
  groups: NavGroup[];
  tone: "navy" | "light";
  homePath: string;
  subtitle: string;
  onNavigate?: () => void;
  onLogout: () => void;
}

export function Sidebar({ groups, tone, homePath, subtitle, onNavigate, onLogout }: SidebarProps) {
  const { user, can } = useAuth();
  const navy = tone === "navy";

  return (
    <div className={cn("flex h-full flex-col", navy ? "bg-primary-900 text-primary-100" : "border-r border-border bg-surface text-ink-soft")}>
      <div className={cn("px-4 py-5", navy ? "border-b border-white/10" : "border-b border-border")}>
        <Logo to={homePath} inverted={navy} size="sm" subtitle={subtitle} />
      </div>

      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group, index) => {
          const items = group.items.filter((item) => !item.permission || can(item.permission));
          if (items.length === 0) return null;
          return (
            <div key={group.title ?? index} className={cn(index > 0 && "mt-6")}>
              {group.title && (
                <p className={cn("mb-2 px-3 text-[0.7rem] font-semibold tracking-wider uppercase", navy ? "text-primary-300" : "text-ink-muted")}>{group.title}</p>
              )}
              <ul className="space-y-0.5">
                {items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                          navy
                            ? isActive
                              ? "bg-white/10 text-white"
                              : "text-primary-100 hover:bg-white/5 hover:text-white"
                            : isActive
                              ? "bg-primary-50 text-primary-900"
                              : "hover:bg-surface-muted hover:text-primary-900",
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Gold marker = selected item */}
                          <span aria-hidden="true" className={cn("absolute inset-y-1.5 left-0 w-1 rounded-r bg-gold-400 transition-opacity", isActive ? "opacity-100" : "opacity-0")} />
                          <item.icon aria-hidden="true" className={cn("size-[1.15rem] shrink-0", isActive && (navy ? "text-gold-300" : "text-primary-700"))} />
                          {item.label}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      {user && (
        <div className={cn("p-3", navy ? "border-t border-white/10" : "border-t border-border")}>
          <div className={cn("flex items-center gap-3 rounded-lg p-2", navy ? "bg-white/5" : "bg-surface-muted")}>
            <Avatar name={user.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm font-medium", navy ? "text-white" : "text-ink")}>{user.displayName}</p>
              <Badge tone={navy ? "gold" : "info"} className="mt-0.5">
                {user.role === "STUDENT" ? user.studentNumber : user.role === "ADMIN" ? "Administrator" : "Staff"}
              </Badge>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="Log out"
              title="Log out"
              className={cn("flex size-9 items-center justify-center rounded-md", navy ? "text-primary-200 hover:bg-white/10 hover:text-white" : "text-ink-muted hover:bg-surface hover:text-danger-700")}
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
