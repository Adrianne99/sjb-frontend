// "Admission requirements" — the document list comes from the database, so when
// the Registrar edits it in Settings -> Requirements, the website updates too.
// Shown as a white checklist card in the Admissions section. id="requirements"
// lets the "View requirements" button scroll here.
import { CircleCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";
import { useApi } from "@/hooks/useApi";
import { requirementService } from "@/services/requirement.service";

export function RequirementsList() {
  const { data, loading, error } = useApi(() => requirementService.listPublic(), []);

  return (
    <div id="requirements" className="mt-16 scroll-mt-24 sm:mt-20">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface lg:grid lg:grid-cols-[1fr_1.6fr]">
        {/* Left: what this list is */}
        <div className="border-b border-border bg-gold-50/60 p-8 sm:p-10 lg:border-r lg:border-b-0">
          <h3 className="font-display text-2xl font-light text-primary-900 sm:text-3xl">Admission requirements</h3>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">Prepare the original copies and bring them to the Registrar&apos;s Office when you visit.</p>
          {data && data.length > 0 && (
            <p className="mt-6 text-sm font-medium text-primary-900">
              {data.length} document{data.length === 1 ? "" : "s"} to bring
            </p>
          )}
        </div>

        {/* Right: the documents */}
        <div className="p-4 sm:p-6">
          {loading ? (
            <ul className="divide-y divide-border" aria-label="Loading requirements">
              {Array.from({ length: 4 }, (_, index) => (
                <li key={index} className="p-4">
                  <Skeleton className="h-10" />
                </li>
              ))}
            </ul>
          ) : error || !data?.length ? (
            <p className="p-4 text-base text-ink-soft">The list of requirements is not available right now. Please contact the Registrar&apos;s Office.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.map((requirement) => (
                <li key={requirement.id} className="flex gap-4 p-4 sm:p-5">
                  <CircleCheck className="mt-0.5 size-6 shrink-0 text-gold-600" strokeWidth={1.75} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-lg font-medium text-primary-900">{requirement.name}</p>
                    {requirement.description && <p className="mt-1 text-base leading-relaxed text-ink-muted">{requirement.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
