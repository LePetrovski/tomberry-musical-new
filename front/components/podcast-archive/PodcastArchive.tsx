"use client";

import type { GuestAppearance, PodcastCategory, PodcastPreview } from "@/lib/sanity/types";
import { GuestAppearancesGrid } from "./GuestAppearancesGrid";
import { PodcastArchiveGrid } from "./PodcastArchiveGrid";
import { PodcastArchiveTabs } from "./PodcastArchiveTabs";
import { PodcastCategoryFilters } from "./PodcastCategoryFilters";
import { PodcastResultsCount } from "./PodcastResultsCount";
import { PodcastSearchInput } from "./PodcastSearchInput";
import { usePodcastFilters } from "./hooks/usePodcastFilters";

type Props = {
  podcasts: PodcastPreview[];
  categories: PodcastCategory[];
  appearances: GuestAppearance[];
};

export function PodcastArchive({ podcasts, categories, appearances }: Props) {
  const {
    selectedView,
    setView,
    selectedCategory,
    searchInput,
    setSearchInput,
    filteredPodcasts,
    filteredAppearances,
    hasActiveFilters,
    isPending,
    updateParams,
  } = usePodcastFilters({ podcasts, appearances });

  const isAppearancesView = selectedView === "apparitions";
  const resultsCount = isAppearancesView
    ? filteredAppearances.length
    : filteredPodcasts.length;

  return (
    <div className={isPending ? "opacity-70 transition-opacity" : undefined}>
      <PodcastArchiveTabs
        selectedView={selectedView}
        onSelectView={setView}
        episodesCount={podcasts.length}
        appearancesCount={appearances.length}
      />

      <div className="mb-10 rounded-2xl bg-primary-500! p-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PodcastSearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder={
              isAppearancesView
                ? "Rechercher une apparition…"
                : "Rechercher un épisode…"
            }
            label={
              isAppearancesView
                ? "Rechercher une apparition"
                : "Rechercher un épisode"
            }
          />
          {hasActiveFilters && (
            <PodcastResultsCount
              count={resultsCount}
              noun={isAppearancesView ? "apparition" : "épisode"}
            />
          )}
        </div>

        {!isAppearancesView && (
          <PodcastCategoryFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={(slug) => updateParams({ categorie: slug })}
          />
        )}
      </div>

      {isAppearancesView ? (
        <GuestAppearancesGrid
          key={`appearances-${filteredAppearances.length}`}
          appearances={filteredAppearances}
          hasActiveFilters={hasActiveFilters}
        />
      ) : (
        <PodcastArchiveGrid
          key={`episodes-${filteredPodcasts.length}`}
          podcasts={filteredPodcasts}
          hasActiveFilters={hasActiveFilters}
        />
      )}
    </div>
  );
}
