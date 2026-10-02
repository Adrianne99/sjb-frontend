// Announcement cards. Content is plain text (never rendered as HTML).
//
//   <AnnouncementFeature>  large: photo + title + excerpt (newest post on the home page)
//   <AnnouncementRow>      small: thumbnail + date + title (the next posts)
//   <AnnouncementTile>     grid card with photo on top (Announcements page)
//   <AnnouncementCard>     compact text card with "Read more" (student dashboard)
//
// The website versions open the full post at /announcements/:id.
import { ArrowRight, ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { Link } from "react-router";
import { school } from "@/config/school";
import { apiUrl } from "@/services/api";
import type { Announcement } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

const announcementLink = (announcement: Announcement) => `/announcements/${announcement.id}`;

/**
 * The cover photo, always the same shape (cropped to fit). Posts without a photo
 * get a navy panel with the school crest, so every card looks finished.
 */
export function AnnouncementPhoto({ announcement, className }: { announcement: Announcement; className?: string }) {
  if (announcement.imagePath) {
    return (
      <img
        src={apiUrl(announcement.imagePath)}
        alt=""
        loading="lazy"
        className={cn("size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]", className)}
      />
    );
  }
  return (
    <div className={cn("flex size-full items-center justify-center bg-linear-to-br from-primary-900 to-primary-700", className)} aria-hidden="true">
      <img src={school.logo.src} alt="" className="h-1/3 max-h-20 w-auto opacity-30" />
    </div>
  );
}

function PostDate({ announcement, className }: { announcement: Announcement; className?: string }) {
  return (
    <time dateTime={announcement.publishDate} className={cn("text-xs font-semibold tracking-[0.18em] text-gold-700 uppercase", className)}>
      {formatDate(announcement.publishDate)}
    </time>
  );
}

/** Large card for the newest post. */
export function AnnouncementFeature({ announcement }: { announcement: Announcement }) {
  return (
    <Link to={announcementLink(announcement)} className="group block focus-visible:outline-none">
      <div className="aspect-16/10 overflow-hidden rounded-2xl bg-primary-900 ring-offset-2 group-focus-visible:ring-2 group-focus-visible:ring-primary-500">
        <AnnouncementPhoto announcement={announcement} />
      </div>
      <PostDate announcement={announcement} className="mt-6 block" />
      <h3 className="mt-3 font-display text-2xl leading-snug font-light text-primary-900 group-hover:text-primary-700 sm:text-3xl">{announcement.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed whitespace-pre-line text-ink-muted">{announcement.content}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium tracking-[0.12em] text-primary-900 uppercase">
        <span className="border-b border-primary-900/30 pb-1 transition-colors group-hover:border-gold-500">Read more</span>
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  );
}

/** Small row: square thumbnail, date and title. */
export function AnnouncementRow({ announcement }: { announcement: Announcement }) {
  return (
    <Link to={announcementLink(announcement)} className="group flex gap-5 py-6 focus-visible:outline-none">
      <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-primary-900 group-focus-visible:ring-2 group-focus-visible:ring-primary-500 sm:size-28">
        <AnnouncementPhoto announcement={announcement} />
      </div>
      <div className="min-w-0">
        <PostDate announcement={announcement} />
        <h3 className="mt-2 font-display text-lg leading-snug font-light text-primary-900 group-hover:text-primary-700">{announcement.title}</h3>
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
      <PostDate announcement={announcement} className="mt-5 block" />
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
      <PostDate announcement={announcement} />
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
