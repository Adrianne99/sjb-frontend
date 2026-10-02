// Native <select> with label + error (best for accessibility and mobile).
//
//   <Select label="Program" options={[{ value: "1", label: "IT" }]} placeholder="Select a program" ... />
import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { Field, type FieldProps } from "./Field";
import { controlClasses } from "./form-styles";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> &
  FieldProps & {
    options: SelectOption[];
    /** Adds an empty first option, e.g. "All programs" or "Select a term". */
    placeholder?: string;
  };

export function Select({ label, error, hint, required, hideLabel, className, options, placeholder, ...selectProps }: SelectProps) {
  return (
    <Field label={label} error={error} hint={hint} required={required} hideLabel={hideLabel} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            id={id}
            required={required}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={controlClasses(invalid, "h-10 appearance-none pr-9 pl-3")}
            {...selectProps}
          >
            {placeholder !== undefined && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted" />
        </div>
      )}
    </Field>
  );
}
