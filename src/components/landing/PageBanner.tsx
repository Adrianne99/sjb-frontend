// Navy title band at the top of inner public pages (About, Contact...).
// pt-20 leaves room for the website header, which sits on top of this band.
import { Breadcrumbs } from "@/components/ui/PageHeader";

export function PageBanner({ title, description }: { title: string; description?: string }) {
  return (
    <div className="relative overflow-hidden bg-primary-900 pt-20">
      <div aria-hidden="true" className="absolute -right-20 -bottom-24 size-72 rounded-full bg-primary-700/40 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="[&_a]:text-primary-200 [&_a:hover]:text-white [&_span]:text-primary-100 [&_svg]:text-primary-300">
          <Breadcrumbs items={[{ label: "Home", to: "/" }, { label: title }]} />
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-primary-100">{description}</p>}
        <span aria-hidden="true" className="mt-6 block h-1 w-16 rounded bg-gold-400" />
      </div>
    </div>
  );
}
