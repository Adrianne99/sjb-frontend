// Search box used above tables. The parent should debounce the value.
import { Search, X } from "lucide-react";
import { TextInput } from "./TextInput";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, label = "Search", placeholder = "Search...", className }: SearchInputProps) {
  return (
    <TextInput
      type="search"
      label={label}
      hideLabel
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={className}
      leftIcon={<Search className="size-4" aria-hidden="true" />}
      rightElement={
        value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex size-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted"
            aria-label="Clear search"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : undefined
      }
    />
  );
}
