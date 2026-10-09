// Website footer: school info, links and Facebook in three columns, then the
// copyright line with Privacy Policy and Terms of Use.
import { Link } from "react-router";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { Logo } from "@/components/ui/Logo";
import { PUBLIC_NAV } from "@/config/navigation";
import { school } from "@/config/school";

export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-primary-950 text-primary-200">
      <div className="h-1 bg-gold-400" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
        <div>
          <Logo inverted size="md" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-primary-200/90">
            The official school management system of {school.name} — student records, enrollment, grades, schedules and payments in one secure place.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-sm font-semibold text-white">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PUBLIC_NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="transition-colors hover:text-gold-300">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/login" className="transition-colors hover:text-gold-300">
                Student Portal
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold text-white">Follow us</h2>
          <a
            href={school.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-white/25 px-5 text-sm text-white transition-colors hover:border-white/60 hover:bg-white/10"
          >
            <FacebookIcon className="size-4" />
            Facebook
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {school.name}. All rights reserved.
          </p>
          <ul className="flex gap-5">
            <li>
              <Link to="/privacy" className="transition-colors hover:text-gold-300">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="transition-colors hover:text-gold-300">
                Terms of Use
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
