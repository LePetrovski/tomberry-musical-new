import { PageWrapper } from "@/components/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function PodcastDetailLoading() {
  return (
    <PageWrapper background="cross" width="wide">
      <span className="sr-only">Chargement de l&apos;épisode…</span>
      <Skeleton className="ff-menu-window ff-archive-window mb-6 h-9 w-72 rounded-xl" />
      <div className="relative isolate">
        <Skeleton className="ff-podcast-hero-media h-[clamp(360px,58vw,720px)] rounded-2xl" />
        <div className="ff-menu-window ff-archive-window ff-podcast-hero-panel relative z-10 mx-3 -mt-12 space-y-4 rounded-2xl p-5 sm:mx-8 sm:-mt-24 sm:p-7 lg:mx-auto lg:max-w-[1120px] lg:p-9">
          <Skeleton className="h-4 w-40 bg-primary-200/20" />
          <Skeleton className="h-8 w-3/4 bg-primary-200/20" />
          <Skeleton className="h-12 w-full bg-primary-200/15" />
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)] lg:items-start">
        <div className="space-y-4 lg:sticky lg:top-28 lg:col-start-2 lg:row-start-2">
          <Skeleton className="ff-menu-window ff-archive-window h-96 rounded-2xl" />
          <Skeleton className="ff-menu-window ff-archive-window h-40 rounded-2xl" />
        </div>
        <Skeleton className="ff-menu-window ff-archive-window h-[420px] rounded-2xl lg:col-start-1 lg:row-start-2" />
      </div>
    </PageWrapper>
  );
}
