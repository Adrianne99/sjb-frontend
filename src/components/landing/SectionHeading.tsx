import { Reveal } from "@/components/ui/Reveal";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  /** id of the <h2>, so the <section> can reference it with aria-labelledby. */
  id?: string;
  title: string;
  description?: ReactNode;
  align?: "left" | "center";
  inverted?: boolean;
}

/** Section title: a light, large heading with an optional short description. */
export function SectionHeading({ id, title, description, align = "center", inverted = false }: SectionHeadingProps) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <h2 id={id} className={cn("text-3xl leading-tight font-light tracking-tight sm:text-4xl lg:text-[2.75rem]", inverted ? "text-white" : "text-primary-900")}>
        {title}
      </h2>
      {description && <p className={cn("mt-4 text-base leading-relaxed", inverted ? "text-primary-200" : "text-ink-muted")}>{description}</p>}
    </Reveal>
  );
}

/** Smaller heading inside a section, e.g. "Admission requirements". `inverted` = on a navy background. */
export function SubHeading({ title, description, inverted = true }: { title: string; description?: string; inverted?: boolean }) {
  return (
    <Reveal className="max-w-2xl">
      <h3 className={cn("font-display text-2xl font-light sm:text-3xl", inverted ? "text-white" : "text-primary-900")}>{title}</h3>
      {description && <p className={cn("mt-2 text-sm leading-relaxed", inverted ? "text-primary-200" : "text-ink-muted")}>{description}</p>}
    </Reveal>
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
