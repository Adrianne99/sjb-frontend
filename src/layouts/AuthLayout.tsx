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
        {/* School photo (src/config/school.ts → images.signIn), with navy at the top and bottom so the text stays readable. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url("${school.images.signIn}")` }} />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-primary-950/85 via-primary-950/60 to-primary-950/95" />
        <div className="relative">
          <Logo inverted size="lg" />
        </div>
        <div className="relative max-w-md">
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
