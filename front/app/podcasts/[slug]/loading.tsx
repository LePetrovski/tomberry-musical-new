import { PageWrapper } from "@/components/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function PodcastDetailLoading() {
  return (
    <PageWrapper background="cross" width="wide">
      <span className="sr-only">Chargement de l&apos;épisode…</span>
      <Skeleton className="ff-menu-window ff-archive-window mb-8 h-9 w-72 rounded-xl" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,.65fr)]">
        <Skeleton className="ff-menu-window ff-archive-window h-[620px] rounded-2xl" />
        <div className="space-y-6">
          <Skeleton className="ff-menu-window ff-archive-window h-96 rounded-2xl" />
          <Skeleton className="ff-menu-window ff-archive-window h-40 rounded-2xl" />
        </div>
      </div>
    </PageWrapper>
  );
}
