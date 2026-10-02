import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger" | "gold";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-ink-soft ring-border-strong",
  info: "bg-primary-50 text-primary-800 ring-primary-200",
  success: "bg-success-50 text-success-700 ring-success-100",
  warning: "bg-warning-50 text-warning-700 ring-warning-100",
  danger: "bg-danger-50 text-danger-700 ring-danger-100",
  gold: "bg-gold-50 text-gold-700 ring-gold-200",
};

export function Badge({ tone = "neutral", icon: Icon, children, className }: { tone?: BadgeTone; icon?: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset", tones[tone], className)}>
      {Icon && <Icon aria-hidden="true" className="size-3.5" />}
      {children}
    </span>
  );
}
