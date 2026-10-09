// "Academic programs": heading + tuition button on the left, the Don Bosco
// statue photo fading in at the top-right (large screens), then three navy
// cards: photo on top with a wave edge, the level, the description, and a round
// gold arrow to "Enroll Now". Text and photos come from src/config/school.ts.
import { ArrowRight, ChefHat, GraduationCap, Monitor, type LucideIcon } from "lucide-react";
import { Link } from "react-router";
import { school } from "@/config/school";
import { SectionHeading } from "./SectionHeading";
import { TuitionFeesButton } from "./TuitionFeesButton";

type Program = (typeof school.programs)[number];

/** Shown on the photo area while a program has no photo yet. */
const PROGRAM_ICONS: Record<string, LucideIcon> = { SHS: GraduationCap, IT: Monitor, HRS: ChefHat };

/**
 * The photo area. Bottom layer: plain navy + icon (always there).
 * Top layer: the photo — if the file is missing it is simply transparent.
 * A navy wave at the bottom joins the photo to the text area.
 */
function ProgramPhoto({ program }: { program: Program }) {
  const Icon = PROGRAM_ICONS[program.code] ?? GraduationCap;
  return (
    <div className="relative h-52 overflow-hidden bg-primary-800 sm:h-60">
      <Icon className="absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 text-white/25" strokeWidth={1.25} aria-hidden="true" />
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${program.image}")` }} />
      <svg aria-hidden="true" viewBox="0 0 400 48" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-px h-10 w-full">
        <path d="M0 48 L0 30 C90 6 200 46 300 22 C340 12 375 4 400 2 L400 48 Z" fill="var(--color-primary-900)" />
      </svg>
    </div>
  );
}

function ProgramCard({ program }: { program: Program }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-primary-900">
      <ProgramPhoto program={program} />
      <div className="flex flex-1 flex-col px-6 pt-3 pb-6 sm:px-7">
        <p className="text-sm font-medium text-gold-300">{program.level}</p>
        <h3 className="mt-1 font-display text-xl font-semibold text-white">{program.name}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-primary-100/80">{program.description}</p>
        <Link
          to="/apply"
          aria-label={`Enroll in ${program.name}`}
          className="mt-5 flex size-10 items-center justify-center self-end rounded-full bg-gold-400 text-primary-950 transition-colors hover:bg-gold-300"
        >
          <ArrowRight className="size-4.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function ProgramsSection() {
  return (
    <section id="academics" aria-labelledby="programs-title" className="relative isolate overflow-hidden bg-background pt-20 pb-14 sm:pt-24 sm:pb-16">
      {/* Don Bosco statue at the top-right, fading softly into the background (large screens). */}
      <img
        src={school.images.programsStatue}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-6 right-0 -z-10 hidden h-104 w-[42%] object-cover object-[center_20%] opacity-45 grayscale lg:block mask-[radial-gradient(ellipse_58%_56%_at_60%_48%,black_30%,transparent_74%)]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="programs-title"
          title="Academic programs"
          description="Senior High School (Grade 11 and 12) and two college programs: Information Technology and Hotel and Restaurant Services."
        />
        <TuitionFeesButton className="mt-6" />

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3 lg:mt-16">
          {school.programs.map((program) => (
            <ProgramCard key={program.code} program={program} />
          ))}
        </div>
      </div>
    </section>
  );
}
