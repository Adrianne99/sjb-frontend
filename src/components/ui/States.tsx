// Empty, loading and error states — use these instead of leaving blank areas.
import { CircleAlert, Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Button } from "./Button";
import { Spinner } from "./Spinner";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

/** e.g. <EmptyState title="No grades published yet." /> */
export function EmptyState({ title, description, icon: Icon = Inbox, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Icon aria-hidden="true" className="size-6" />
      </div>
      <p className="font-display text-base font-semibold text-primary-900">{title}</p>
      {description && <p className="mt-1 max-w-md text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** e.g. <LoadingState label="Loading grades..." /> */
export function LoadingState({ label = "Loading...", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex items-center justify-center gap-3 px-6 py-12 text-sm text-ink-muted", className)}>
      <Spinner className="text-primary-600" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry, className }: { message: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <CircleAlert aria-hidden="true" className="size-6" />
      </div>
      <p className="font-display font-semibold text-primary-900">We couldn't load this information</p>
      <p className="mt-1 max-w-md text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
