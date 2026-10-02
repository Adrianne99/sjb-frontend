// Text input with label + error.  Works for type="text" | "email" | "date" | "number" | "time"...
//
//   <TextInput label="First name" required value={v} onChange={...} error={errors.firstName} />
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Field, type FieldProps } from "./Field";
import { controlClasses } from "./form-styles";

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> &
  FieldProps & {
    leftIcon?: ReactNode;
    rightElement?: ReactNode;
  };

export function TextInput({ label, error, hint, required, hideLabel, className, leftIcon, rightElement, ...inputProps }: TextInputProps) {
  return (
    <Field label={label} error={error} hint={hint} required={required} hideLabel={hideLabel} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          {leftIcon && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-muted">{leftIcon}</span>}
          <input
            id={id}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={controlClasses(invalid, cn("h-10 px-3", Boolean(leftIcon) && "pl-10", Boolean(rightElement) && "pr-11"))}
            {...inputProps}
          />
          {rightElement && <span className="absolute inset-y-0 right-1 flex items-center">{rightElement}</span>}
        </div>
      )}
    </Field>
  );
}
