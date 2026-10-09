// Latest PUBLIC announcements from the backend (published, not expired).
//
// Home page:            the newest post large, the next ones as small rows beside it.
// Announcements page:   every post as a grid of photo tiles (`layout="grid"`).
// Clicking a post opens it in full at /announcements/:id.
import { Megaphone } from "lucide-react";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/States";
import { useApi } from "@/hooks/useApi";
import { announcementService } from "@/services/admin.service";
import { AnnouncementFeature, AnnouncementRow, AnnouncementTile } from "./AnnouncementCard";
import { SectionHeading } from "./SectionHeading";

interface AnnouncementsSectionProps {
  limit?: number;
  showAllLink?: boolean;
  /** "feature" (home page) or "grid" (Announcements page). */
  layout?: "feature" | "grid";
  /** Hide the section title (the Announcements page has its own banner). */
  showHeading?: boolean;
}

export function AnnouncementsSection({ limit = 4, showAllLink = true, layout = "feature", showHeading = true }: AnnouncementsSectionProps) {
  const { data, loading, error } = useApi(() => announcementService.listPublic(), []);
  const items = (data ?? []).slice(0, limit);
  const [newest, ...rest] = items;

  return (
    <section id="announcements" aria-labelledby="announcements-heading" className="bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showHeading && (
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading id="announcements-heading" title="Announcements" />
            {showAllLink && items.length > 0 && (
              <Link to="/announcements" className="text-sm font-semibold text-primary-900 underline decoration-primary-900/30 underline-offset-4 hover:decoration-primary-900">
                Show all announcements
              </Link>
            )}
          </div>
        )}

        <div className={showHeading ? "mt-12" : undefined}>
          {loading ? (
            <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]" role="status" aria-label="Loading announcements">
              <Skeleton className="aspect-16/10 rounded-2xl" />
              <div className="space-y-6">
                {Array.from({ length: 3 }, (_, index) => (
                  <Skeleton key={index} className="h-24" />
                ))}
              </div>
            </div>
          ) : error || items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-strong">
              <EmptyState icon={Megaphone} title="No announcements available." description={error ? "Announcements could not be loaded right now. Please check back later." : "New school announcements will appear here."} />
            </div>
          ) : layout === "grid" ? (
            <ul className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((announcement) => (
                <li key={announcement.id}>
                  <AnnouncementTile announcement={announcement} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
              <div>
                <AnnouncementFeature announcement={newest} />
              </div>
              {rest.length > 0 && (
                <ul className="space-y-4 lg:self-start">
                  {rest.map((announcement) => (
                    <li key={announcement.id}>
                      <AnnouncementRow announcement={announcement} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
