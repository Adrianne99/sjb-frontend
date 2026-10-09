// White card that overlaps the bottom of the hero, showing the school's values
// (Integrity, Excellence, Service) from src/config/school.ts.
import { Award, HeartHandshake, ShieldCheck, type LucideIcon } from "lucide-react";
import { school } from "@/config/school";

/** One icon per value, in the same order as `school.about.values`. */
const VALUE_ICONS: LucideIcon[] = [ShieldCheck, Award, HeartHandshake];

export function ValuesStrip() {
  return (
    <div className="relative z-10 -mt-16">
      {/* Below the hero's edge, the background matches the Programs section underneath. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-16 bottom-0 -z-10 bg-background" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul aria-label="Our values" className="grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-surface sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {school.about.values.map((value, index) => {
            const Icon = VALUE_ICONS[index % VALUE_ICONS.length];
            return (
              // Phones: compact rows (icon on the left). Larger screens: centered columns.
              <li key={value.title} className="flex gap-4 px-5 py-5 sm:flex-col sm:items-center sm:px-6 sm:py-7 sm:text-center">
                <Icon className="size-7 shrink-0 text-primary-800 sm:size-8" strokeWidth={1.5} aria-hidden="true" />
                <div>
                  <p className="font-display text-base font-semibold text-primary-900 sm:mt-3">{value.title}</p>
                  <p className="mt-1 max-w-64 text-sm leading-relaxed text-ink-muted sm:mt-1.5">{value.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
