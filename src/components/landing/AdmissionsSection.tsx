// "How to enroll": the five admission steps in a row (numbered badge, icon,
// title, text, arrows in between — a list on phones), then the requirements
// checklist and the "Apply online" call to action.
// Steps come from src/config/school.ts (admissionSteps).
import { BadgeCheck, ChevronRight, ClipboardCheck, FileText, MonitorSmartphone, Wallet, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { school } from "@/config/school";
import { RequirementsList } from "./RequirementsList";
import { SectionHeading } from "./SectionHeading";

/** One icon per step, in the same order as `school.admissionSteps`. */
const STEP_ICONS: LucideIcon[] = [MonitorSmartphone, FileText, ClipboardCheck, Wallet, BadgeCheck];

export function AdmissionsSection() {
  const steps = school.admissionSteps;
  return (
    <section id="admissions" aria-labelledby="admissions-heading" className="bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            id="admissions-heading"
            title="How to enroll"
            description="Five steps for Senior High School and college applicants — start online, finish at the school."
          />
         
        </div>

        <ol className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-4">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index % STEP_ICONS.length];
            return (
              <li key={step.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                <div className="flex shrink-0 flex-col items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-full bg-gold-100 text-xs font-semibold text-gold-700 tabular-nums" aria-hidden="true">
                    {index + 1}
                  </span>
                  <Icon className="size-9 text-primary-800" strokeWidth={1.4} aria-hidden="true" />
                </div>
                <div className="md:mt-2">
                  <p className="font-display text-base font-semibold text-primary-900">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight aria-hidden="true" className="absolute top-9 -right-4 hidden size-5 text-primary-300 md:block" />
                )}
              </li>
            );
          })}
        </ol>

        <RequirementsList />

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Link
            to="/apply"
            className="inline-flex h-12 items-center rounded-full bg-gold-400 px-7 text-sm font-semibold text-primary-950 transition-colors hover:bg-gold-300"
          >
            Apply online
          </Link>
          <Link to="/#contact" className="text-sm font-semibold text-primary-900 underline decoration-primary-900/30 underline-offset-4 hover:decoration-primary-900">
            Contact the Registrar&apos;s Office
          </Link>
        </div>
      </div>
    </section>
  );
}
