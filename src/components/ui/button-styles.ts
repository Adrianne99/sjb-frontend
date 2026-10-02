// Button class names, shared by <Button> and <ButtonLink>.
import { cn } from "@/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none " +
  "transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800",
  secondary: "border border-border-strong bg-surface text-primary-800 shadow-sm hover:border-primary-300 hover:bg-primary-50",
  ghost: "text-primary-700 hover:bg-primary-50 active:bg-primary-100",
  danger: "bg-danger-600 text-white shadow-sm hover:bg-danger-700",
  gold: "bg-gold-400 text-primary-950 shadow-sm hover:bg-gold-300",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", fullWidth = false, className?: string) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}
