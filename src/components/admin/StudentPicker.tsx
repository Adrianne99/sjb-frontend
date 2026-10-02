// Search-as-you-type student chooser for forms (enrollment, payments).
import { Search, X } from "lucide-react";
import { useId, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { useApi } from "@/hooks/useApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { studentService } from "@/services/student.service";
import type { StudentSummary } from "@/types";

interface StudentPickerProps {
  value: StudentSummary | null;
  onChange: (student: StudentSummary | null) => void;
  error?: string;
  label?: string;
}

export function StudentPicker({ value, onChange, error, label = "Student" }: StudentPickerProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 300);
  const results = useApi(() => (debounced.length >= 2 ? studentService.list({ search: debounced, pageSize: 8 }).then((page) => page.items) : Promise.resolve([])), [debounced]);

  if (value) {
    return (
      <div>
        <p className="mb-1.5 text-sm font-medium text-ink-soft">{label}</p>
        <div className="flex items-center justify-between gap-3 rounded-md border border-primary-200 bg-primary-50 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-primary-900">{value.formalName}</p>
            <p className="text-xs text-ink-muted">
              {value.studentNumber} · {value.programCode}
            </p>
          </div>
          <button type="button" onClick={() => onChange(null)} aria-label="Change student" className="flex size-8 items-center justify-center rounded text-ink-muted hover:bg-surface">
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label} <span className="text-danger-600" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          id={id}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a student number or name..."
          autoComplete="off"
          aria-invalid={Boolean(error) || undefined}
          className="h-10 w-full rounded-md border border-border-strong bg-surface pr-9 pl-9 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none"
        />
        {results.loading && debounced.length >= 2 && <Spinner size="sm" className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-muted" />}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger-700">{error}</p>}
      {debounced.length >= 2 && !results.loading && (
        <ul className="mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-surface shadow-md" aria-label="Matching students">
          {(results.data ?? []).length === 0 ? (
            <li className="px-3 py-3 text-sm text-ink-muted">No matching students.</li>
          ) : (
            results.data!.map((student) => (
              <li key={student.id}>
                <button type="button" onClick={() => onChange(student)} className="flex w-full flex-col px-3 py-2 text-left hover:bg-primary-50">
                  <span className="text-sm font-medium text-ink">{student.formalName}</span>
                  <span className="text-xs text-ink-muted">
                    {student.studentNumber} · {student.programCode}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
