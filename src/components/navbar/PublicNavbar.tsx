// Public website header. It has NO background: it sits on top of the hero
// photo (home) or the navy page banner (inner pages), so header and hero read
// as one. It scrolls away with the page instead of sticking to the top.
// Desktop: links in a row. Phones: a menu button that opens a dark panel.
// Menu links slide to sections of the landing page (see PUBLIC_NAV in
// config/navigation.ts); Announcements is the only separate page.
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Logo } from "@/components/ui/Logo";
import { PUBLIC_NAV } from "@/config/navigation";
import { useActiveSection } from "@/hooks/useActiveSection";
import { useAuth } from "@/hooks/useAuth";
import { homePathFor } from "@/contexts/auth-context";
import { cn } from "@/utils/cn";

export function PublicNavbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu after navigating (also when sliding to a section).
  const [lastKey, setLastKey] = useState(location.key);
  if (lastKey !== location.key) {
    setLastKey(location.key);
    setOpen(false);
  }

  // Highlight the section on screen (landing page) or the current page (Announcements).
  const onLanding = location.pathname === "/";
  const activeSection = useActiveSection(
    PUBLIC_NAV.map((item) => item.section),
    onLanding,
  );
  const isActive = (item: (typeof PUBLIC_NAV)[number]) => (onLanding ? activeSection === item.section : location.pathname.startsWith(item.to));

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const portalLink = user ? { to: homePathFor(user), label: "My Portal" } : { to: "/login", label: "Login" };

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-6 border-b border-white/10">
          <Logo size="sm" inverted className="min-w-0" />

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {PUBLIC_NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={isActive(item) ? "location" : undefined}
                    className={cn(
                      "relative py-2 text-sm font-medium transition-colors",
                      "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-gold-400 after:transition-transform after:duration-300",
                      isActive(item) ? "text-white after:scale-x-100" : "text-white/70 after:scale-x-0 hover:text-white hover:after:scale-x-100",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Login is always visible — on phones it sits right beside the menu button. */}
            <Link
              to={portalLink.to}
              className="group inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-4 py-2 text-xs font-semibold text-primary-950 transition-colors hover:bg-gold-300 sm:h-10 sm:gap-2 sm:px-5 sm:text-sm"
            >
              {portalLink.label}
              <ArrowRight className="size-3.5 sm:size-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex size-10 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden"
            >
              {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-menu"
            aria-label="Mobile"
            className="mt-2 rounded-2xl border border-white/10 bg-primary-950 p-3 lg:hidden"
          >
            <ul>
              {PUBLIC_NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={isActive(item) ? "location" : undefined}
                    className={cn(
                      "block rounded-lg px-4 py-3 text-base font-medium",
                      isActive(item) ? "text-gold-300" : "text-white/80 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
