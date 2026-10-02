// School crest + name. The image path comes from src/config/school.ts.
// The crest keeps its aspect ratio (height is fixed, width is automatic).
import { Link } from "react-router";
import { school } from "@/config/school";
import { cn } from "@/utils/cn";

interface LogoProps {
  /** "full" = crest + school name, "mark" = crest only. */
  variant?: "full" | "mark";
  /** Use on dark (navy) backgrounds. */
  inverted?: boolean;
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  to?: string;
  className?: string;
}

// The official crest is detailed, so it is shown a little larger than a simple icon.
const crestSizes = { sm: "h-11", md: "h-12", lg: "h-20" };

export function Logo({ variant = "full", inverted = false, size = "md", subtitle, to = "/", className }: LogoProps) {
  const content = (
    <>
      <img src={school.logo.src} alt={variant === "mark" ? school.logo.alt : ""} className={cn(crestSizes[size], "w-auto shrink-0 object-contain")} />
      {variant === "full" && (
        <span className="min-w-0 leading-tight">
          <span className={cn("block font-display font-semibold", size === "lg" ? "text-lg" : "text-sm sm:text-[0.95rem]", inverted ? "text-white" : "text-primary-900")}>
            {/* Phones show the short name so the header stays one line tall. */}
            <span className={size === "lg" ? undefined : "sm:hidden"}>{size === "lg" ? school.name : school.shortName}</span>
            {size !== "lg" && <span className="hidden sm:inline">{school.name}</span>}
          </span>
          <span className={cn("block truncate text-xs", inverted ? "text-primary-200" : "text-ink-muted")}>{subtitle ?? school.location}</span>
        </span>
      )}
    </>
  );

  return (
    <Link to={to} className={cn("flex items-center gap-3 rounded-md", className)} aria-label={variant === "mark" ? `${school.name} home` : undefined}>
      {content}
    </Link>
  );
}
