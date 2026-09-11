import { PageWrapper } from "@/components/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function PodcastDetailLoading() {
  return (
    <PageWrapper background="cross" width="wide">
      <span className="sr-only">Chargement de l&apos;épisode…</span>
      <Skeleton className="mb-8 h-5 w-72 rounded-full bg-secondary-100" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,.65fr)]">
        <Skeleton className="h-[620px] rounded-[2rem] bg-secondary-100" />
        <div className="space-y-6">
          <Skeleton className="h-96 rounded-[1.5rem] bg-secondary-100" />
          <Skeleton className="h-40 rounded-[1.5rem] bg-secondary-100" />
        </div>
      </div>
    </PageWrapper>
  );
}
