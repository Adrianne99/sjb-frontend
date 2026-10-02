// Split layout for login and password pages: school identity on the left
// (desktop only), the form on the right.
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { Logo } from "@/components/ui/Logo";
import { school } from "@/config/school";

export function AuthLayout({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate hidden overflow-hidden bg-primary-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* Campus photo + the same blue overlay as the landing page hero (both set in src/config/school.ts). */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover"
          style={{ backgroundImage: `url("${school.hero.backgroundImage}")`, backgroundPosition: school.hero.backgroundPosition }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-primary-950 opacity-98"
          
        />
        <div aria-hidden="true" className="absolute -top-32 -left-32 size-112 rounded-full bg-primary-700/50 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-24 bottom-0 size-80 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative">
          <Logo inverted size="lg" />
        </div>
        <div className="relative max-w-md">
          <span aria-hidden="true" className="mb-6 block h-1 w-14 rounded bg-gold-400" />
          <p className="font-display text-3xl leading-snug font-semibold text-white">{school.hero.headline}</p>
          <p className="mt-4 text-primary-200">
            One secure place for student records, enrollment, grades, class schedules and payments.
          </p>
        </div>
        <p className="relative flex items-center gap-2 text-sm text-primary-200">
          <ShieldCheck className="size-4 text-gold-300" aria-hidden="true" />
          Your session is protected. Never share your password with anyone.
        </p>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <div className="lg:hidden">
          <Logo size="sm" />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <div className="mt-2 text-sm text-ink-muted">{description}</div>}
          <div className="mt-8">{children}</div>
        </div>
        <p className="text-center text-xs text-ink-muted">
          <Link to="/" className="hover:text-primary-700 hover:underline">
            ← Back to the school website
          </Link>
        </p>
      </main>
    </div>
  );
}
