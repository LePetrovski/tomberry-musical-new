import { PageWrapper } from "@/components/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompilationDetailLoading() {
  return (
    <PageWrapper background="cross" width="wide">
      <span className="sr-only">Chargement de la compilation…</span>
      <Skeleton className="mb-6 h-6 w-72 bg-secondary-200/45" />
      <div className="ff-menu-window ff-archive-window mb-6 space-y-4 rounded-2xl p-5 sm:p-7">
        <Skeleton className="h-6 w-28 bg-primary-200/20" />
        <Skeleton className="h-12 w-3/4 bg-primary-200/20" />
        <Skeleton className="h-5 w-96 max-w-full bg-primary-200/15" />
      </div>
      <div className="grid overflow-hidden rounded-2xl border-2 border-secondary-200/80 bg-secondary-900 shadow-xl xl:grid-cols-[minmax(560px,.88fr)_minmax(0,1.12fr)]">
        <div className="bg-secondary-800 p-5 sm:p-8">
          <Skeleton className="mb-4 h-4 w-32 bg-primary-200/15" />
          <Skeleton className="mx-auto aspect-square w-full max-w-[520px] rounded-2xl bg-primary-200/12" />
          <Skeleton className="mt-5 h-12 w-full bg-primary-200/12" />
        </div>
        <div className="space-y-4 bg-primary-500 p-5 sm:p-8">
          <Skeleton className="h-16 w-full bg-secondary-200/45" />
          <Skeleton className="h-10 w-48 bg-secondary-200/45" />
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full bg-secondary-200/40" />
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
