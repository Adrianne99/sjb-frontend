// One announcement in full ("Read more"), like a blog post: title, date,
// cover photo and the whole text. Only live PUBLIC announcements open here.
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import { AnnouncementPhoto } from "@/components/landing/AnnouncementCard";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { announcementService } from "@/services/admin.service";
import { formatDate } from "@/utils/format";

export default function AnnouncementDetailPage() {
  const id = Number(useParams().id);
  const { data, loading, error } = useApi(() => announcementService.getPublic(id), [id]);
  useDocumentTitle(data?.title ?? "Announcement");

  return (
    <article className="bg-surface">
      {/* Navy band behind the header (the website header sits on top of it). */}
      <div className="bg-primary-900 pt-20">
        <div className="mx-auto max-w-4xl px-4 pt-12 pb-28 sm:px-6 sm:pt-16 sm:pb-36">
          <Link to="/announcements" className="group inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-primary-200 uppercase hover:text-white">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            All announcements
          </Link>
          {loading ? (
            <Skeleton className="mt-8 h-12 w-3/4 bg-white/10" />
          ) : data ? (
            <>
              <p className="mt-8 text-xs font-semibold tracking-[0.2em] text-gold-300 uppercase">
                <time dateTime={data.publishDate}>{formatDate(data.publishDate)}</time>
              </p>
              <h1 className="mt-4 text-3xl leading-tight font-light text-white sm:text-5xl">{data.title}</h1>
            </>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 sm:pb-28">
        {error ? (
          <div className="-mt-16 rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
            <p className="text-lg font-light text-primary-900">This announcement is no longer available.</p>
            <ButtonLink to="/announcements" variant="secondary" className="mt-6">
              See all announcements
            </ButtonLink>
          </div>
        ) : loading || !data ? (
          <Skeleton className="-mt-20 aspect-video rounded-2xl" />
        ) : (
          <>
            {/* The photo overlaps the navy band, like the Mission & Vision cards. */}
            <div className="-mt-20 aspect-video overflow-hidden rounded-2xl bg-primary-900 shadow-[0_30px_60px_-30px_rgba(12,24,51,0.5)] sm:-mt-24">
              <AnnouncementPhoto announcement={data} />
            </div>
            <div className="mx-auto mt-12 max-w-2xl text-base leading-[1.85] whitespace-pre-line text-ink-soft sm:text-lg">{data.content}</div>
            <div className="mx-auto mt-14 max-w-2xl border-t border-border pt-8">
              <Link to="/announcements" className="group inline-flex items-center gap-2 text-sm font-medium tracking-[0.12em] text-primary-900 uppercase">
                <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
                <span className="border-b border-primary-900/30 pb-1 group-hover:border-gold-500">Back to all announcements</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
