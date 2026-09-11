import { PageWrapper } from "@/components/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function PodcastsLoading() {
  return (
    <PageWrapper background="polka" width="wide">
      <span className="sr-only">Chargement des podcasts…</span>
      <Skeleton className="mb-8 h-5 w-52 rounded-full bg-secondary-100" />
      <Skeleton className="h-[540px] rounded-[2rem] bg-secondary-100" />
      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-96 rounded-[1.5rem] bg-secondary-100" />
        ))}
      </div>
    </PageWrapper>
  );
}
