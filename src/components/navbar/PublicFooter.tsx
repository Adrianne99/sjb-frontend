import { Link } from "react-router";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { Logo } from "@/components/ui/Logo";
import { PUBLIC_NAV } from "@/config/navigation";
import { school } from "@/config/school";

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary-950 text-primary-200">
      {/* Thin gold rule echoing the crest */}
      <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-300 to-gold-500" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="md:col-span-2">
          <Logo inverted size="md" />
          <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-200/90">
            The official school management system of {school.name} — student records, enrollment, grades, schedules and payments in one secure place.
          </p>
          <a
            href={school.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            <FacebookIcon className="size-4" />
            Facebook
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-sm font-semibold text-white">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {PUBLIC_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/login" className="hover:text-white hover:underline">
                Student Portal
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {school.name}. All rights reserved.
          </p>
          <ul className="flex gap-4">
            <li>
              <Link to="/privacy" className="hover:text-white hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-white hover:underline">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
