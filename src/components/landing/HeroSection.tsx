// Full-width hero. The website header (PublicNavbar) sits on top of it.
//
// Large screens: the photo fills the right side and stays clearly visible; it
// fades into navy only behind the text on the left. A navy diagonal corner sits
// at the bottom-right. Phones: the photo sits behind a navy layer so the text
// stays easy to read. Text and the photo path come from src/config/school.ts. If
// the photo is missing, the navy background is shown, so the hero never looks broken.
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { school } from "@/config/school";

export function HeroSection() {
  const { hero } = school;
  return (
    <section id="home" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-primary-950">
      {/* Photo: the whole hero on phones, the right part on large screens. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-cover lg:left-[30%]"
        style={{ backgroundPosition: hero.backgroundPosition, backgroundImage: `url("${hero.backgroundImage}")` }}
      />

      {/* Phones: navy over the whole photo. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-primary-950/85 lg:hidden" />
      {/* Large screens: solid navy behind the text, fading to clear by the middle of the photo. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden lg:block"
        style={{ background: `linear-gradient(90deg, ${hero.overlayColor} 34%, ${hero.overlayColor}b3 46%, ${hero.overlayColor}1a 62%, transparent 75%)` }}
      />
      {/* Slightly darker top edge, so the menu stays readable over the sky. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 hidden h-32 bg-linear-to-b from-primary-950/60 to-transparent lg:block" />

      {/* Navy diagonal corner at the bottom-right (large screens). */}
      <div aria-hidden="true" className="absolute right-0 bottom-0 -z-10 hidden h-[44%] w-[30%] bg-primary-950 [clip-path:polygon(100%_0,100%_100%,0_100%)] lg:block opacity-90" />

      {/* The bottom padding leaves room for the values card that overlaps the bottom of the hero. */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-32 pb-28 sm:px-6 sm:pt-40 sm:pb-32 lg:px-8 lg:pt-44 lg:pb-40">
        <div className="max-w-xl">
          <h1 id="hero-title" className="text-4xl leading-[1.12] font-light tracking-tight text-white sm:text-5xl lg:text-6xl">
            {hero.headline}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-primary-100/90 sm:text-[1.05rem]">{hero.subheadline}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to={hero.primaryCta.to}
              className="inline-flex h-12 items-center gap-2.5 rounded-full bg-gold-400 px-7 text-sm font-semibold text-primary-950 transition-colors hover:bg-gold-300"
            >
              {hero.primaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              to={hero.secondaryCta.to}
              className="inline-flex h-12 items-center gap-2.5 rounded-full border border-white/60 px-7 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              {hero.secondaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
