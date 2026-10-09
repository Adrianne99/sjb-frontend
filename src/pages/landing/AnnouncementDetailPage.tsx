// One announcement in full ("Read more"), like a blog post: title, date,
// cover photo and the whole text. Only live PUBLIC announcements open here.
import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router";
import { AnnouncementPhoto, PostMeta } from "@/components/landing/AnnouncementCard";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useApi } from "@/hooks/useApi";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { announcementService } from "@/services/admin.service";

export default function AnnouncementDetailPage() {
  const id = Number(useParams().id);
  const { data, loading, error } = useApi(() => announcementService.getPublic(id), [id]);
  useDocumentTitle(data?.title ?? "Announcement");

  return (
    <article className="bg-surface">
      {/* Navy band behind the header (the website header sits on top of it). */}
      <div className="bg-primary-900 pt-20">
        <div className="mx-auto max-w-4xl px-4 pt-12 pb-28 sm:px-6 sm:pt-16 sm:pb-36">
          <Link to="/announcements" className="inline-flex items-center gap-2 text-sm font-medium text-primary-200 hover:text-white">
            <ArrowLeft className="size-4" aria-hidden="true" />
            All announcements
          </Link>
          {loading ? (
            <Skeleton className="mt-8 h-12 w-3/4 bg-white/10" />
          ) : data ? (
            <>
              <PostMeta announcement={data} inverted className="mt-8" />
              <h1 className="mt-4 text-3xl leading-tight font-light text-white sm:text-5xl">{data.title}</h1>
            </>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 sm:pb-28">
        {error ? (
          <div className="-mt-16 rounded-2xl border border-border bg-surface p-10 text-center">
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
            <div className="-mt-20 aspect-video overflow-hidden rounded-2xl bg-primary-900 sm:-mt-24">
              <AnnouncementPhoto announcement={data} />
            </div>
            <div className="mx-auto mt-12 max-w-2xl text-base leading-[1.85] whitespace-pre-line text-ink-soft sm:text-lg">{data.content}</div>
            <div className="mx-auto mt-14 max-w-2xl border-t border-border pt-8">
              <Link to="/announcements" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-900 hover:underline">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to all announcements
              </Link>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
