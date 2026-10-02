import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { ButtonLink } from "@/components/ui/Button";
import { school } from "@/config/school";
import { RequirementsList } from "./RequirementsList";
import { TuitionFeesTable } from "./TuitionFeesTable";
import { SectionHeading } from "./SectionHeading";

export function AdmissionsSection() {
  return (
    <section id="admissions" aria-labelledby="admissions-heading" className="bg-primary-900 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <SectionHeading id="admissions-heading" title="How to enroll" align="left" inverted />
          <p className="text-base leading-relaxed text-primary-200 lg:max-w-md lg:justify-self-end">
            Five steps for Senior High School and college applicants — start online, finish at the school.
          </p>
        </div>

        {/* Timeline: a thin line with gold dots — across on desktop, down the side on phones. */}
        <ol className="mt-14 grid md:grid-cols-5">
          {school.admissionSteps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 110} className="relative border-l border-white/20 pb-10 pl-7 last:pb-0 md:border-t md:border-l-0 md:pt-8 md:pr-6 md:pb-0 md:pl-0">
              <span aria-hidden="true" className="absolute top-1 -left-1.25 size-2.5 rounded-full bg-gold-400 md:-top-1.25 md:left-0" />
              <span className="font-display text-sm font-medium text-gold-300 tabular-nums" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 font-display text-xl font-light text-white">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-primary-200">{step.description}</p>
            </Reveal>
          ))}
        </ol>

        <RequirementsList />

        <TuitionFeesTable />

        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-white/15 pt-10">
          <ButtonLink to="/apply" variant="gold" size="lg" className="rounded-full! px-7!" rightIcon={<ArrowRight className="size-4" aria-hidden="true" />}>
            Apply online
          </ButtonLink>
          <Link to="/#contact" className="group inline-flex items-center gap-2 text-sm font-medium tracking-[0.12em] text-white uppercase">
            <span className="border-b border-white/40 pb-1 transition-colors group-hover:border-gold-300">Contact the Registrar&apos;s Office</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
