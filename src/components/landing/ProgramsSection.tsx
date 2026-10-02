import { Reveal } from "@/components/ui/Reveal";
import { school } from "@/config/school";
import { cn } from "@/utils/cn";
import { PlaceholderNote, SectionHeading } from "./SectionHeading";

type Program = (typeof school.programs)[number];

/**
 * A program panel. The first program is "featured" (large navy panel); the
 * others are lighter cards stacked beside it. A big, faint program code sits in
 * the corner as a watermark. Data comes from src/config/school.ts.
 */
function ProgramPanel({ program, featured }: { program: Program; featured: boolean }) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col justify-between overflow-hidden rounded-2xl transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_60px_-30px_rgba(12,24,51,0.45)]",
        featured ? "min-h-80 bg-primary-900 p-8 text-white sm:p-10 lg:min-h-full" : "border border-border bg-surface p-8",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -top-5 -right-3 font-display leading-none font-semibold tracking-tight select-none",
          featured ? "text-[9rem] text-white/6 sm:text-[11rem]" : "text-[6rem] text-primary-900/5",
        )}
      >
        {program.code}
      </span>
      <p className={cn("relative text-xs font-semibold tracking-[0.2em] uppercase", featured ? "text-gold-300" : "text-gold-700")}>{program.level}</p>
      <div className={cn("relative", featured ? "mt-16" : "mt-8")}>
        <h3 className={cn("font-display font-light", featured ? "text-3xl text-white sm:text-4xl" : "text-2xl text-primary-900")}>{program.name}</h3>
        <p className={cn("mt-3 max-w-md text-sm leading-relaxed", featured ? "text-primary-200" : "text-ink-muted")}>{program.description}</p>
      </div>
    </article>
  );
}

export function ProgramsSection() {
  const [featured, ...others] = school.programs;
  return (
    <section id="academics" aria-labelledby="programs-title" className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="programs-title"
          title="Academic programs"
          align="left"
          description="Senior High School (Grade 11 and 12) and two college programs: Information Technology and Hotel and Restaurant Services."
        />
        <PlaceholderNote className="mt-3" />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {featured && (
            <Reveal className="h-full">
              <ProgramPanel program={featured} featured />
            </Reveal>
          )}
          <div className="grid gap-6">
            {others.map((program, index) => (
              <Reveal key={`${program.code}-${index}`} delay={(index + 1) * 120} className="h-full">
                <ProgramPanel program={program} featured={false} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
