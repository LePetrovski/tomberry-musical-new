import { PodcastCard } from "@/components/PodcastCard";
import type { PodcastPreview } from "@/lib/sanity/types";

type Props = {
  podcasts: PodcastPreview[];
  hasActiveFilters: boolean;
};

export function PodcastArchiveGrid({ podcasts, hasActiveFilters }: Props) {
  if (podcasts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-zinc-600">
        {hasActiveFilters
          ? "Aucun épisode ne correspond à votre recherche."
          : "Aucun podcast publié pour le moment."}
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {podcasts.map((podcast) => (
        <PodcastCard key={podcast._id} podcast={podcast} />
      ))}
    </div>
  );
}
