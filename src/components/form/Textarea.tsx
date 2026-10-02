import type { TextareaHTMLAttributes } from "react";
import { Field, type FieldProps } from "./Field";
import { controlClasses } from "./form-styles";

type TextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & FieldProps;

export function Textarea({ label, error, hint, required, hideLabel, className, rows = 4, ...textareaProps }: TextareaProps) {
  return (
    <Field label={label} error={error} hint={hint} required={required} hideLabel={hideLabel} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={controlClasses(invalid, "px-3 py-2 leading-relaxed")}
          {...textareaProps}
        />
      )}
    </Field>
  );
}
