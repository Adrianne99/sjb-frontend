// A single key number (dashboard summary).
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { cn } from "@/utils/cn";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  hint?: ReactNode;
  /** Color of the icon badge: "gold" for highlighted figures, "warning" for things that need attention. */
  accent?: "primary" | "gold" | "warning";
  to?: string;
}

const accents = {
  primary: "bg-primary-50 text-primary-700",
  gold: "bg-gold-50 text-gold-700",
  warning: "bg-warning-50 text-warning-700",
};

export function StatCard({ label, value, icon: Icon, hint, accent = "primary", to }: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold text-primary-900 tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", accents[accent])}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
    </>
  );

  const classes = "block rounded-lg border border-border bg-surface p-5 shadow-sm";
  return to ? (
    <Link to={to} className={cn(classes, "transition-shadow hover:shadow-md")}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
