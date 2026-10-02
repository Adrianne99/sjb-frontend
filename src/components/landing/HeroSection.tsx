// Full-width hero with a replaceable background photo. The website header
// (PublicNavbar) sits on top of it with no background, so they read as one.
// The photo path is in src/config/school.ts. If the file is missing, the navy
// gradient underneath is shown instead, so the hero never looks broken.
import { ArrowRight, LogIn } from "lucide-react";
import { Link } from "react-router";
import { ButtonLink } from "@/components/ui/Button";
import { school } from "@/config/school";

export function HeroSection() {
  return (
    <section id="home" aria-labelledby="hero-title" className="relative isolate flex min-h-svh items-center overflow-hidden bg-primary-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 animate-hero-zoom bg-cover"
        style={{
          backgroundPosition: school.hero.backgroundPosition,
          backgroundImage: `url("${school.hero.backgroundImage}"), linear-gradient(-135deg, var(--color-primary-950), var(--color-primary-700))`,
        }}
      />
      {/* Full blue overlay over the photo. Change the color and strength in src/config/school.ts (hero.overlayColor / hero.overlayOpacity). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-primary-950 via-primary-950/98 to-primary-950/95 opacity-98"
       
      />

      {/* The large bottom padding leaves room for the Mission & Vision cards that overlap the bottom of the hero. */}
      {/* Top padding keeps the headline below the website header on short screens (e.g. iPhone in-app browsers). */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-22 pb-36 sm:px-6 sm:pt-28 sm:pb-44 lg:px-8">
        <div className="max-w-3xl">
          <h1 id="hero-title" className="animate-rise text-4xl leading-[1.12] font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
            {school.hero.headline}
          </h1>
          <p className="mt-6 max-w-xl animate-rise text-base leading-relaxed text-primary-100/90 [animation-delay:150ms] sm:text-lg">{school.hero.subheadline}</p>

          {/* Both buttons side by side and vertically centered on every screen size (they wrap only on very narrow phones). */}
          <div className="mt-10 flex animate-rise flex-wrap items-center gap-x-5 gap-y-4 [animation-delay:300ms] sm:gap-x-8">
            <ButtonLink to={school.hero.primaryCta.to} variant="gold" size="lg" className="rounded-full! px-5! sm:px-7!" leftIcon={<LogIn className="size-5" aria-hidden="true" />}>
              {school.hero.primaryCta.label}
            </ButtonLink>
            <Link
              to={school.hero.secondaryCta.to}
              className="group inline-flex items-center gap-2 text-sm font-medium tracking-[0.08em] text-white uppercase sm:tracking-[0.14em]"
            >
              <span className="border-b border-white/40 pb-1 transition-colors group-hover:border-gold-300">{school.hero.secondaryCta.label}</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
