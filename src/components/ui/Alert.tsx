// Inline message box. Tone is shown with an icon AND color (never color alone).
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Tone = "info" | "success" | "warning" | "danger";

const styles: Record<Tone, { box: string; icon: typeof Info }> = {
  info: { box: "border-primary-200 bg-primary-50 text-primary-900", icon: Info },
  success: { box: "border-success-100 bg-success-50 text-success-700", icon: CircleCheck },
  warning: { box: "border-warning-100 bg-warning-50 text-warning-700", icon: TriangleAlert },
  danger: { box: "border-danger-100 bg-danger-50 text-danger-700", icon: CircleAlert },
};

interface AlertProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Alert({ tone = "info", title, children, action, className }: AlertProps) {
  const { box, icon: Icon } = styles[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm", box, className)}>
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "leading-relaxed")}>{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
