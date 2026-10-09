// Announcement cards. Content is plain text (never rendered as HTML).
//
//   <AnnouncementFeature>  large: photo + title + excerpt (newest post on the home page)
//   <AnnouncementRow>      small: thumbnail + date + title (the next posts)
//   <AnnouncementTile>     grid card with photo on top (Announcements page)
//   <AnnouncementCard>     compact text card with "Read more" (student dashboard)
//
// The website versions open the full post at /announcements/:id.
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "react-router";
import { school } from "@/config/school";
import { apiUrl } from "@/services/api";
import type { Announcement } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import { ANNOUNCEMENT_CATEGORY_LABELS } from "@/utils/labels";

const announcementLink = (announcement: Announcement) => `/announcements/${announcement.id}`;

/**
 * A school photo for posts without their own (from school.images.announcementFallbacks).
 * The announcement ID picks it, so the same post always shows the same photo.
 */
function fallbackPhotoFor(announcement: Announcement) {
  const photos = school.images.announcementFallbacks;
  return photos[announcement.id % photos.length];
}

/**
 * The cover photo, always the same shape (cropped to fit). Posts without a
 * photo get one of the school's own photos, so every card looks finished.
 */
export function AnnouncementPhoto({ announcement, className }: { announcement: Announcement; className?: string }) {
  const src = announcement.imagePath ? apiUrl(announcement.imagePath) : fallbackPhotoFor(announcement);
  return <img src={src} alt="" loading="lazy" className={cn("size-full bg-primary-800 object-cover", className)} />;
}

/**
 * The category tag and the date, e.g. [EVENT] Sep 15, 2026.
 * `inverted` = on a navy background (the full announcement page).
 */
export function PostMeta({ announcement, inverted = false, className }: { announcement: Announcement; inverted?: boolean; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2.5 gap-y-1", className)}>
      <span className={cn("rounded px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide uppercase", inverted ? "bg-gold-400 text-primary-950" : "bg-gold-100 text-gold-700")}>
        {ANNOUNCEMENT_CATEGORY_LABELS[announcement.category]}
      </span>
      <time dateTime={announcement.publishDate} className={cn("text-xs font-medium", inverted ? "text-primary-100" : "text-ink-muted")}>
        {formatDate(announcement.publishDate)}
      </time>
    </div>
  );
}


/** Large white card for the newest post: photo on top, then date, title, excerpt. */
export function AnnouncementFeature({ announcement }: { announcement: Announcement }) {
  return (
    <Link
      to={announcementLink(announcement)}
      className="group block h-full overflow-hidden rounded-2xl border border-border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      <div className="aspect-video overflow-hidden bg-primary-900">
        <AnnouncementPhoto announcement={announcement} />
      </div>
      <div className="p-6 sm:p-7">
        <PostMeta announcement={announcement} />
        <h3 className="mt-2 font-display text-xl leading-snug font-light text-primary-900 group-hover:text-primary-700 sm:text-2xl">{announcement.title}</h3>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed whitespace-pre-line text-ink-muted">{announcement.content}</p>
        <span className="mt-4 inline-block text-sm font-semibold text-primary-800 underline decoration-primary-800/30 underline-offset-4 group-hover:decoration-primary-800">Read more</span>
      </div>
    </Link>
  );
}

/** Small row: thumbnail, date tag, title and a short excerpt. */
export function AnnouncementRow({ announcement }: { announcement: Announcement }) {
  return (
    <Link
      to={announcementLink(announcement)}
      className="group flex gap-4 rounded-xl p-2 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 sm:gap-5"
    >
      <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-primary-900 sm:h-24 sm:w-32">
        <AnnouncementPhoto announcement={announcement} />
      </div>
      <div className="min-w-0 py-0.5">
        <PostMeta announcement={announcement} />
        <h3 className="mt-1 font-display text-base leading-snug font-semibold text-primary-900 group-hover:text-primary-700">{announcement.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{announcement.content}</p>
      </div>
    </Link>
  );
}

/** Grid card with the photo on top (Announcements page). */
export function AnnouncementTile({ announcement }: { announcement: Announcement }) {
  return (
    <Link to={announcementLink(announcement)} className="group flex h-full flex-col focus-visible:outline-none">
      <div className="aspect-4/3 overflow-hidden rounded-2xl bg-primary-900 group-focus-visible:ring-2 group-focus-visible:ring-primary-500">
        <AnnouncementPhoto announcement={announcement} />
      </div>
      <PostMeta announcement={announcement} className="mt-5" />
      <h3 className="mt-2 font-display text-xl leading-snug font-light text-primary-900 group-hover:text-primary-700">{announcement.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">{announcement.content}</p>
    </Link>
  );
}

/** Compact text card with an in-place "Read more" (used in the student portal). */
export function AnnouncementCard({ announcement, compact = false }: { announcement: Announcement; compact?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  // Roughly: will the text be cut off at 3 lines?
  const isLong = announcement.content.length > 120 || announcement.content.split("\n").length > 2;

  return (
    <article className={cn("flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-sm", compact && "shadow-none")}>
      <PostMeta announcement={announcement} />
      <h3 className="mt-2 text-base font-semibold">{announcement.title}</h3>
      <p id={contentId} className={cn("mt-2 flex-1 text-sm leading-relaxed whitespace-pre-line text-ink-soft", !expanded && "line-clamp-3")}>
        {announcement.content}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={contentId}
          className="mt-3 inline-flex items-center gap-1 self-start text-sm font-medium text-primary-700 hover:text-primary-900"
        >
          {expanded ? "Show less" : "Read more"}
          <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} aria-hidden="true" />
        </button>
      )}
    </article>
  );
}
