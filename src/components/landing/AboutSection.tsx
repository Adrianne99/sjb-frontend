import { Reveal } from "@/components/ui/Reveal";
import { Compass, Eye, type LucideIcon } from "lucide-react";
import { school } from "@/config/school";
import { SectionHeading } from "./SectionHeading";

/**
 * One Mission / Vision card. Solid white with a thin border and a soft shadow
 * (no glass or blur), so it reads cleanly over the hero photo and the page.
 */
function StatementCard({ icon: Icon, label, text }: { icon: LucideIcon; label: string; text: string }) {
  return (
    <article className="h-full rounded-2xl border border-border bg-surface p-8 transition-shadow duration-500 hover:shadow-[0_30px_60px_-28px_rgba(12,24,51,0.5)] shadow-[0_24px_50px_-28px_rgba(12,24,51,0.45)] sm:p-10">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full border border-gold-300 text-gold-600" aria-hidden="true">
          <Icon className="size-4.5" strokeWidth={1.75} />
        </span>
        <h3 className="text-xs font-semibold tracking-[0.28em] text-gold-700 uppercase">{label}</h3>
      </div>
      <p className="mt-6 font-display text-lg leading-relaxed font-light text-primary-900 sm:text-xl">{text}</p>
    </article>
  );
}

export function AboutSection() {
  const { about } = school;
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-32 bg-surface pb-20 sm:scroll-mt-36 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mission & Vision float over the bottom edge of the hero (negative top margin).
            scroll-mt on the section keeps the cards in view when the menu slides to "About". */}
        <div className="relative z-10 -mt-24 grid gap-6 sm:-mt-28 md:grid-cols-2">
          {/* Part of the hero visually, so they rise in right after the hero text (not on scroll). */}
          <div className="animate-rise [animation-delay:450ms]">
            <StatementCard icon={Compass} label="Our Mission" text={about.mission} />
          </div>
          <div className="animate-rise [animation-delay:570ms]">
            <StatementCard icon={Eye} label="Our Vision" text={about.vision} />
          </div>
        </div>

        <div className="mt-20 grid items-start gap-8 sm:mt-24 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <SectionHeading id="about-title" eyebrow="About the school" title={school.name} align="left" />
          <div>
            <p className="text-base leading-relaxed text-ink-soft lg:pt-8">{about.intro}</p>
            {about.placeholder}
          </div>
        </div>

        {/* Institutional values: three columns with gold numerals and thin dividers (no boxes or icons). */}
        <div className="mt-20 border-t border-border pt-14 sm:mt-24">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.28em] text-gold-700 uppercase">
            <span aria-hidden="true" className="h-px w-8 bg-current opacity-70" />
            Institutional values
          </p>
          <ul className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border">
            {about.values.map((value, index) => (
              <Reveal as="li" key={value.title} delay={index * 120} className="sm:px-8 sm:first:pl-0 sm:last:pr-0">
                <span className="font-display text-sm font-medium text-gold-600 tabular-nums" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-3 font-display text-2xl font-light text-primary-900">{value.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{value.description}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
