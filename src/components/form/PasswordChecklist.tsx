// Live checklist under a new-password field. This is only a helper — the
// backend enforces the real rules.
import { Check, Circle } from "lucide-react";
import { cn } from "@/utils/cn";

function passwordRules(password: string) {
  return [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains a letter", ok: /[A-Za-z]/.test(password) },
    { label: "Contains a number", ok: /[0-9]/.test(password) },
  ];
}

export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1" aria-label="Password requirements">
      {passwordRules(password).map((rule) => (
        <li key={rule.label} className={cn("flex items-center gap-2 text-xs", rule.ok ? "text-success-700" : "text-ink-muted")}>
          {rule.ok ? <Check className="size-3.5" aria-hidden="true" /> : <Circle className="size-3" aria-hidden="true" />}
          {rule.label}
          <span className="sr-only">{rule.ok ? "(met)" : "(not met)"}</span>
        </li>
      ))}
    </ul>
  );
}
