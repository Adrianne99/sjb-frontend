import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  /** id of the <h2>, so the <section> can reference it with aria-labelledby. */
  id?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  /** true = on a navy background (white text). */
  inverted?: boolean;
}

/** Section title: a large, light heading and an optional short description. */
export function SectionHeading({ id, title, description, align = "left", inverted = false }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <h2 id={id} className={cn("text-3xl leading-tight font-light tracking-tight sm:text-4xl lg:text-[2.75rem]", inverted ? "text-white" : "text-primary-900")}>
        {title}
      </h2>
      {description && <p className={cn("mt-3 text-base leading-relaxed", inverted ? "text-primary-100/85" : "text-ink-soft")}>{description}</p>}
    </div>
  );
}

/** Visible in development only: a quiet reminder of which text is not official yet. */
export function PlaceholderNote({ className }: { className?: string }) {
  if (!import.meta.env.DEV) return null;
  return (
    <p className={cn("text-xs text-ink-muted italic opacity-80", className)}>
      Sample text — replace it in <code className="font-mono not-italic">src/config/school.ts</code>
    </p>
  );
}
