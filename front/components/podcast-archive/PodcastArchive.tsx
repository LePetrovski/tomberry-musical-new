"use client";

import { Grid2X2, List, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import type {
  CompilationPreview,
  GuestAppearance,
  PodcastCategory,
  PodcastPreview,
} from "@/lib/sanity/types";
import { CompilationArchiveGrid } from "./CompilationArchiveGrid";
import { GuestAppearancesGrid } from "./GuestAppearancesGrid";
import { PodcastArchiveGrid } from "./PodcastArchiveGrid";
import { PodcastArchiveTabs } from "./PodcastArchiveTabs";
import { PodcastCategoryFilters } from "./PodcastCategoryFilters";
import { PodcastResultsCount } from "./PodcastResultsCount";
import { PodcastSearchInput } from "./PodcastSearchInput";
import { usePodcastFilters, type ArchiveSort } from "./hooks/usePodcastFilters";

type Props = {
  podcasts: PodcastPreview[];
  categories: PodcastCategory[];
  appearances: GuestAppearance[];
  compilations: CompilationPreview[];
};

type DisplayMode = "grid" | "list";

const VIEW_STORAGE_KEY = "tomberry:podcasts:view";
const VIEW_CHANGE_EVENT = "tomberry-podcast-view-change";
const PAGE_SIZE = 12;
const SORT_LABELS: Record<ArchiveSort, string> = {
  recent: "Plus récents",
  oldest: "Plus anciens",
  az: "Titre A–Z",
};

function subscribeToDisplayMode(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(VIEW_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(VIEW_CHANGE_EVENT, callback);
  };
}

function getDisplayModeSnapshot(): DisplayMode {
  return window.localStorage.getItem(VIEW_STORAGE_KEY) === "list" ? "list" : "grid";
}

function getDisplayModeServerSnapshot(): DisplayMode {
  return "grid";
}

function ArchiveResults({
  selectedView,
  podcasts,
  appearances,
  compilations,
  hasActiveFilters,
  displayMode,
  resetKey,
}: {
  selectedView: "episodes" | "apparitions" | "compilations";
  podcasts: PodcastPreview[];
  appearances: GuestAppearance[];
  compilations: CompilationPreview[];
  hasActiveFilters: boolean;
  displayMode: DisplayMode;
  resetKey: string;
}) {
  const [pagination, setPagination] = useState({ key: resetKey, count: PAGE_SIZE });
  const visibleCount = pagination.key === resetKey ? pagination.count : PAGE_SIZE;
  const total =
    selectedView === "apparitions"
      ? appearances.length
      : selectedView === "compilations"
        ? compilations.length
        : podcasts.length;
  const visiblePodcasts = podcasts.slice(0, visibleCount);
  const visibleAppearances = appearances.slice(0, visibleCount);
  const visibleCompilations = compilations.slice(0, visibleCount);
  const remaining = Math.max(0, total - visibleCount);

  return (
    <div>
      {selectedView === "apparitions" ? (
        <GuestAppearancesGrid
          appearances={visibleAppearances}
          hasActiveFilters={hasActiveFilters}
          displayMode={displayMode}
        />
      ) : selectedView === "compilations" ? (
        <CompilationArchiveGrid
          compilations={visibleCompilations}
          hasActiveFilters={hasActiveFilters}
          displayMode={displayMode}
        />
      ) : (
        <PodcastArchiveGrid
          podcasts={visiblePodcasts}
          hasActiveFilters={hasActiveFilters}
          displayMode={displayMode}
        />
      )}

      {remaining > 0 ? (
        <div className="mt-10 flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="ff-menu-window ff-load-more min-w-56 px-7 text-primary-200"
            onClick={() =>
              setPagination({ key: resetKey, count: visibleCount + PAGE_SIZE })
            }
          >
            <span aria-hidden="true" className="text-[0.62rem] text-primary-200">◆</span>
            Afficher {Math.min(PAGE_SIZE, remaining)} de plus
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function PodcastArchive({ podcasts, categories, appearances, compilations }: Props) {
  const {
    selectedView,
    setView,
    selectedCategory,
    selectedSort,
    searchInput,
    setSearchInput,
    filteredPodcasts,
    filteredAppearances,
    filteredCompilations,
    hasActiveFilters,
    isPending,
    updateParams,
  } = usePodcastFilters({ podcasts, appearances, compilations });
  const displayMode = useSyncExternalStore(
    subscribeToDisplayMode,
    getDisplayModeSnapshot,
    getDisplayModeServerSnapshot,
  );

  const isAppearancesView = selectedView === "apparitions";
  const isEpisodesView = selectedView === "episodes";
  const isCompilationsView = selectedView === "compilations";
  const resultsCount = isAppearancesView
    ? filteredAppearances.length
    : isCompilationsView
      ? filteredCompilations.length
      : filteredPodcasts.length;
  const activeCategory = categories.find((category) => category.slug === selectedCategory);

  const setDisplayMode = (mode: DisplayMode) => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
    window.dispatchEvent(new Event(VIEW_CHANGE_EVENT));
  };

  const setSort = (sort: ArchiveSort) => {
    updateParams({ tri: sort === "oldest" ? "ancien" : sort === "az" ? "az" : null });
  };

  const resetFilters = () => {
    setSearchInput("");
    updateParams({ q: null, categorie: null, tri: null });
  };

  const resultsKey = `${selectedView}-${selectedCategory}-${selectedSort}-${searchInput}-${displayMode}`;

  return (
    <section aria-label="Archives des podcasts" className="mt-12">
      <div className="ff-menu-window ff-archive-window mb-5 flex flex-col gap-4 rounded-2xl p-4 sm:p-5 lg:flex-row lg:items-end lg:justify-between">
        <p className="ff-archive-kicker text-xs font-semibold uppercase tracking-[0.18em]">
          Tous les contenus
        </p>
        <PodcastArchiveTabs
          selectedView={selectedView}
          onSelectView={setView}
          episodesCount={podcasts.length}
          appearancesCount={appearances.length}
          compilationsCount={compilations.length}
        />
      </div>

      <div className="mb-10">
        <div
          className={`ff-menu-window ff-archive-window ff-command-bar rounded-2xl p-3 transition-opacity ${isPending ? "opacity-70" : "opacity-100"}`}
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">
              <PodcastSearchInput
                value={searchInput}
                onChange={setSearchInput}
                placeholder={
                  isAppearancesView
                    ? "Rechercher une apparition…"
                    : isCompilationsView
                      ? "Rechercher une compilation…"
                      : "Rechercher un épisode…"
                }
                label={
                  isAppearancesView
                    ? "Rechercher une apparition"
                    : isCompilationsView
                      ? "Rechercher une compilation"
                      : "Rechercher un épisode"
                }
              />
            </div>

            {isEpisodesView && categories.length > 0 ? (
              <div className="hidden shrink-0 lg:block">
                <label className="sr-only" htmlFor="podcast-category">
                  Filtrer par catégorie
                </label>
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={(value) =>
                    updateParams({ categorie: value === "all" ? null : value })
                  }
                >
                  <SelectTrigger
                    id="podcast-category"
                    className="ff-command-field h-10 w-44 px-3"
                  >
                    <SelectValue>
                      {() => activeCategory?.title ?? "Toutes catégories"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="ff-select-popup">
                    <SelectItem value="all" className="ff-select-item">Toutes catégories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category.slug} className="ff-select-item">
                        {category.title}{category.featured ? " ★" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <label className="sr-only" htmlFor="podcast-sort">
              Trier les résultats
            </label>
            <Select value={selectedSort} onValueChange={(value) => setSort(value as ArchiveSort)}>
              <SelectTrigger
                id="podcast-sort"
                className="ff-command-field h-10 w-full shrink-0 px-3 lg:w-40"
              >
                <SelectValue>
                  {(value) => SORT_LABELS[value as ArchiveSort] ?? SORT_LABELS.recent}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="ff-select-popup">
                <SelectItem value="recent" className="ff-select-item">Plus récents</SelectItem>
                <SelectItem value="oldest" className="ff-select-item">Plus anciens</SelectItem>
                <SelectItem value="az" className="ff-select-item">Titre A–Z</SelectItem>
              </SelectContent>
            </Select>

            {isEpisodesView ? (
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger
                    render={<Button type="button" variant="ghost" className="ff-command-button h-10 w-full" />}
                  >
                    <SlidersHorizontal aria-hidden="true" />
                    Catégories
                  </SheetTrigger>
                  <SheetContent className="ff-mobile-sheet">
                    <SheetHeader>
                      <SheetTitle className="ff-archive-title text-lg">Filtrer les épisodes</SheetTitle>
                      <SheetDescription className="ff-archive-copy">
                        Choisissez une catégorie. La recherche et le tri restent actifs.
                      </SheetDescription>
                    </SheetHeader>
                    <Separator className="bg-primary-200/20" />
                    <div className="overflow-y-auto p-4">
                      <PodcastCategoryFilters
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={(slug) => updateParams({ categorie: slug })}
                        showPlaylistLink={false}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : null}

            <div className="flex h-10 shrink-0 items-center justify-between gap-1 rounded-xl border border-primary-200/25 bg-secondary-900/35 p-1 shadow-[inset_0_0_0_1px_rgb(7_26_42_/_0.5)]">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="ff-command-button"
                onClick={() => setDisplayMode("grid")}
                aria-label="Afficher en grille"
                aria-pressed={displayMode === "grid"}
              >
                <Grid2X2 aria-hidden="true" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                className="ff-command-button"
                onClick={() => setDisplayMode("list")}
                aria-label="Afficher en liste"
                aria-pressed={displayMode === "list"}
              >
                <List aria-hidden="true" />
              </Button>
            </div>

            <div className="ff-command-status flex shrink-0 items-center justify-between gap-2 px-2 lg:justify-start">
              <PodcastResultsCount
                count={resultsCount}
                noun={
                  isAppearancesView
                    ? "apparition"
                    : isCompilationsView
                      ? "compilation"
                      : "épisode"
                }
              />
              {hasActiveFilters ? (
                <Button type="button" variant="ghost" size="icon-sm" className="ff-command-button" onClick={resetFilters}>
                  <RotateCcw aria-hidden="true" />
                  <span className="sr-only">Réinitialiser les filtres</span>
                </Button>
              ) : null}
            </div>
          </div>

          {activeCategory?.youtubePlaylistUrl ? (
            <div className="mt-2 border-t border-primary-200/20 px-1 pt-2">
              <a
                href={activeCategory.youtubePlaylistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ff-menu-list-link rounded-lg px-2 py-1.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
              >
                Voir la playlist YouTube « {activeCategory.title} » →
              </a>
            </div>
          ) : null}
        </div>
      </div>

      <ArchiveResults
        selectedView={selectedView}
        podcasts={filteredPodcasts}
        appearances={filteredAppearances}
        compilations={filteredCompilations}
        hasActiveFilters={hasActiveFilters}
        displayMode={displayMode}
        resetKey={resultsKey}
      />
    </section>
  );
}
