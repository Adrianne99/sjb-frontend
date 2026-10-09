// Navy title band at the top of inner public pages (Announcements, Apply...).
// pt-20 leaves room for the website header, which sits on top of this band.
// Large screens: a school photo on the right, fading into navy behind the title
// (like the landing page hero). The photo is set in src/config/school.ts (images.pageBanner).
import { Breadcrumbs } from "@/components/ui/PageHeader";
import { school } from "@/config/school";

export function PageBanner({ title, description }: { title: string; description?: string }) {
  return (
    <div className="relative isolate overflow-hidden bg-primary-900 pt-20">
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 -z-20 hidden w-1/2 bg-cover bg-center lg:block"
        style={{ backgroundImage: `url("${school.images.pageBanner}")` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden lg:block"
        style={{ background: "linear-gradient(90deg, var(--color-primary-900) 50%, rgb(21 40 81 / 0.75) 62%, rgb(21 40 81 / 0.15) 100%)" }}
      />
      {/* Slightly darker top edge, so the menu stays readable over the photo. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 hidden h-24 bg-linear-to-b from-primary-950/60 to-transparent lg:block" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="[&_a]:text-primary-200 [&_a:hover]:text-white [&_span]:text-primary-100 [&_svg]:text-primary-300">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: title }]} />
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-primary-100">{description}</p>}
      </div>
    </div>
  );
}
