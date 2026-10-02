// Wraps a form control with its label, hint and error message, and wires up
// the accessibility attributes (aria-describedby / aria-invalid) for it.
import { CircleAlert } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface FieldProps {
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
  /** Hide the label visually (still read by screen readers). */
  hideLabel?: boolean;
  className?: string;
}

interface FieldRenderProps {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

export function Field({ label, error, hint, required, hideLabel, className, children }: FieldProps & { children: (props: FieldRenderProps) => ReactNode }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className={cn("mb-1.5 block text-sm font-medium text-ink-soft", hideLabel && "sr-only")}>
        {label}
        {required && (
          <span className="ml-0.5 text-danger-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger-700">
          <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
