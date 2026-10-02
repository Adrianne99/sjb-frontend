import { LoaderCircle } from "lucide-react";
import { cn } from "@/utils/cn";

const sizes = { sm: "size-4", md: "size-5", lg: "size-8" };

export function Spinner({ size = "md", className }: { size?: keyof typeof sizes; className?: string }) {
  return <LoaderCircle aria-hidden="true" className={cn("animate-spin", sizes[size], className)} />;
}
