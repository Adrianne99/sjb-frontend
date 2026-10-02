import { cn } from "@/utils/cn";
import { initials } from "@/utils/format";

export function Avatar({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg" };
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-display font-semibold text-primary-800 ring-2 ring-gold-200", sizes[size], className)}
    >
      {initials(name) || "?"}
    </span>
  );
}
