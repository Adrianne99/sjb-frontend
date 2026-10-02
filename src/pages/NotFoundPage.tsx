import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <SearchX className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-ink-muted">The page you are looking for does not exist or has been moved.</p>
      <ButtonLink to="/" className="mt-6">
        Go to the homepage
      </ButtonLink>
    </div>
  );
}
