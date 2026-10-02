import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/cn";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "id"> & {
  label: ReactNode;
  description?: ReactNode;
};

export function Checkbox({ label, description, className, ...inputProps }: CheckboxProps) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        aria-describedby={description ? `${id}-description` : undefined}
        className="mt-0.5 size-4 shrink-0 cursor-pointer rounded border-border-strong accent-primary-600"
        {...inputProps}
      />
      <div className="text-sm">
        <label htmlFor={id} className="cursor-pointer font-medium text-ink-soft">
          {label}
        </label>
        {description && (
          <p id={`${id}-description`} className="mt-0.5 text-xs text-ink-muted">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
