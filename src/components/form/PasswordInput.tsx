// Password input with a show/hide toggle.
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { TextInput, type TextInputProps } from "./TextInput";

export function PasswordInput(props: Omit<TextInputProps, "type" | "rightElement">) {
  const [visible, setVisible] = useState(false);
  return (
    <TextInput
      {...props}
      type={visible ? "text" : "password"}
      leftIcon={<Lock className="size-4" aria-hidden="true" />}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="flex size-9 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-primary-700"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        </button>
      }
    />
  );
}
