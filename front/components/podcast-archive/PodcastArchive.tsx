"use client";

import type { PodcastCategory, PodcastPreview } from "@/lib/sanity/types";
import { PodcastArchiveGrid } from "./PodcastArchiveGrid";
import { PodcastCategoryFilters } from "./PodcastCategoryFilters";
import { PodcastResultsCount } from "./PodcastResultsCount";
import { PodcastSearchInput } from "./PodcastSearchInput";
import { usePodcastFilters } from "./hooks/usePodcastFilters";

type Props = {
  podcasts: PodcastPreview[];
  categories: PodcastCategory[];
};

export function PodcastArchive({ podcasts, categories }: Props) {
  const {
    selectedCategory,
    searchInput,
    setSearchInput,
    filteredPodcasts,
    hasActiveFilters,
    isPending,
    updateParams,
  } = usePodcastFilters({ podcasts });

  return (
    <div className={isPending ? "opacity-70 transition-opacity" : undefined}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PodcastSearchInput value={searchInput} onChange={setSearchInput} />
        {hasActiveFilters && <PodcastResultsCount count={filteredPodcasts.length} />}
      </div>

      <PodcastCategoryFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(slug) => updateParams({ categorie: slug })}
      />

      <PodcastArchiveGrid podcasts={filteredPodcasts} hasActiveFilters={hasActiveFilters} />
    </div>
  );
}
