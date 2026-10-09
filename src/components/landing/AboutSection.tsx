// "About": campus photo on the left, a navy panel with a diagonal edge on the
// right with the school's introduction, and the Mission and Vision underneath.
// Text and photo path come from src/config/school.ts (about).
import { Compass, Eye, type LucideIcon } from "lucide-react";
import { school } from "@/config/school";

/** Mission / Vision: icon, label and text. */
function Statement({ icon: Icon, label, text }: { icon: LucideIcon; label: string; text: string }) {
  return (
    <div className="flex gap-4">
      <Icon className="mt-0.5 size-6 shrink-0 text-gold-300" strokeWidth={1.5} aria-hidden="true" />
      <div>
        <h3 className="font-display text-base font-semibold text-white">{label}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-primary-100/80">{text}</p>
      </div>
    </div>
  );
}

export function AboutSection() {
  const { about } = school;
  return (
    <section id="about" aria-labelledby="about-title" className="relative scroll-mt-20 bg-primary-950 lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      {/* Wavy top edge: the light Programs background curves over the top of this section. */}
      <svg aria-hidden="true" viewBox="0 0 1440 64" preserveAspectRatio="none" className="absolute inset-x-0 -top-px z-10 h-8 w-full sm:h-12 lg:h-16">
        <path d="M0 0 H1440 V14 C1190 62 780 -4 400 38 C240 55 100 52 0 42 Z" fill="var(--color-background)" />
      </svg>

      {/* Photo (on phones: a banner above the text). */}
      <div
        aria-hidden="true"
        className="h-64 bg-primary-900 bg-cover bg-center sm:h-80 lg:absolute lg:inset-y-0 lg:left-0 lg:h-auto lg:w-[56%]"
        style={{ backgroundImage: `url("${about.image}")` }}
      />

      {/* Navy panel with a diagonal left edge over the photo (large screens). */}
      <div className="relative bg-primary-950 lg:col-start-2 lg:[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%)]">
        <div className="px-4 pt-12 pb-16 sm:px-10 sm:pt-16 sm:pb-20 lg:pt-32 lg:pb-24 lg:pr-12 lg:pl-[18%] xl:pr-20">
          <h2 id="about-title" className="text-3xl leading-tight font-light tracking-tight text-white sm:text-4xl">
            {school.name}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-primary-100/85">{about.intro}</p>

          <div className="mt-10 grid grid-cols-1 gap-8 border-t border-white/15 pt-8 sm:grid-cols-2">
            <Statement icon={Compass} label="Our Mission" text={about.mission} />
            <Statement icon={Eye} label="Our Vision" text={about.vision} />
          </div>
        </div>
      </div>
    </section>
  );
}
