// Separate public pages. About, Academics, Admissions and Contact are sections
// of the landing page (HomePage); only Announcements and the legal pages have
// their own page.
import { AnnouncementsSection } from "@/components/landing/AnnouncementsSection";
import { PageBanner } from "@/components/landing/PageBanner";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { school } from "@/config/school";

export function AnnouncementsPage() {
  useDocumentTitle("Announcements");
  return (
    <>
      <PageBanner title="Announcements" description="News and updates from the school." />
      <AnnouncementsSection limit={50} showAllLink={false} layout="grid" showHeading={false} />
    </>
  );
}

/** Privacy Policy / Terms placeholders — the school must supply the final text. */
export function LegalPage({ kind }: { kind: "privacy" | "terms" }) {
  const title = kind === "privacy" ? "Privacy Policy" : "Terms of Use";
  useDocumentTitle(title);
  return (
    <>
      <PageBanner title={title} />
      <div className="mx-auto max-w-3xl px-4 py-16 text-ink-soft sm:px-6">
        <p className="leading-relaxed">
           The official {title.toLowerCase()} of {school.name} will be published here.
          {kind === "privacy" &&
            " It should explain, in line with the Data Privacy Act of 2012 (Republic Act No. 10173), what personal data the school collects, why, who can access it, how long it is kept and how students can exercise their rights."}
        </p>
        <p className="mt-4 leading-relaxed">
          This system only shows students their own records, limits staff access by role, and records important actions in an audit log.
        </p>
      </div>
    </>
  );
}
