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
import type { CompilationPreview, GuestAppearance, PodcastCategory, PodcastPreview } from "@/lib/sanity/types";
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
        <GuestAppearancesGrid appearances={visibleAppearances} hasActiveFilters={hasActiveFilters} displayMode={displayMode} />
      ) : selectedView === "compilations" ? (
        <CompilationArchiveGrid compilations={visibleCompilations} hasActiveFilters={hasActiveFilters} displayMode={displayMode} />
      ) : (
        <PodcastArchiveGrid podcasts={visiblePodcasts} hasActiveFilters={hasActiveFilters} displayMode={displayMode} />
      )}

      {remaining > 0 ? (
        <div className="mt-10 flex justify-center">
          <Button type="button" variant="outline" size="lg" onClick={() => setPagination({ key: resetKey, count: visibleCount + PAGE_SIZE })}>
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
    <section aria-labelledby="podcast-archive-title" className="mt-16">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-500">Tous les contenus</p>
          <h2 id="podcast-archive-title" className="mt-2 text-4xl! font-semibold tracking-tight text-secondary-900">Explorer les archives</h2>
        </div>
        <PodcastArchiveTabs selectedView={selectedView} onSelectView={setView} episodesCount={podcasts.length} appearancesCount={appearances.length} compilationsCount={compilations.length} />
      </div>

      <div className={`sticky top-24 z-20 mb-10 rounded-[1.75rem] border border-secondary-500/15 bg-primary-500/95 p-4 shadow-[0_14px_45px_rgba(39,62,63,0.10)] backdrop-blur transition-opacity sm:p-5 ${isPending ? "opacity-70" : "opacity-100"}`}>
        <div className="grid gap-3 lg:grid-cols-[minmax(280px,1fr)_auto_auto_auto] lg:items-center">
          <PodcastSearchInput
            value={searchInput}
            onChange={setSearchInput}
            placeholder={isAppearancesView ? "Rechercher une apparition…" : isCompilationsView ? "Rechercher une compilation…" : "Rechercher un épisode…"}
            label={isAppearancesView ? "Rechercher une apparition" : isCompilationsView ? "Rechercher une compilation" : "Rechercher un épisode"}
          />

          <label className="sr-only" htmlFor="podcast-sort">Trier les résultats</label>
          <Select value={selectedSort} onValueChange={(value) => setSort(value as ArchiveSort)}>
            <SelectTrigger id="podcast-sort" className="h-12 w-full rounded-full border-secondary-500/25 bg-primary-200 px-4 text-secondary-900 lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-secondary-500/15 bg-primary-200 text-secondary-900">
              <SelectItem value="recent">Plus récents</SelectItem>
              <SelectItem value="oldest">Plus anciens</SelectItem>
              <SelectItem value="az">Titre A–Z</SelectItem>
            </SelectContent>
          </Select>

          {isEpisodesView ? (
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger render={<Button type="button" variant="outline" className="w-full" />}>
                  <SlidersHorizontal aria-hidden="true" />
                  Catégories
                </SheetTrigger>
                <SheetContent className="bg-primary-500 text-secondary-900">
                  <SheetHeader>
                    <SheetTitle className="text-secondary-900">Filtrer les épisodes</SheetTitle>
                    <SheetDescription className="text-secondary-600">Choisissez une catégorie. La recherche et le tri restent actifs.</SheetDescription>
                  </SheetHeader>
                  <Separator className="bg-secondary-500/15" />
                  <div className="overflow-y-auto p-4">
                    <PodcastCategoryFilters categories={categories} selectedCategory={selectedCategory} onSelectCategory={(slug) => updateParams({ categorie: slug })} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2 rounded-full border border-secondary-500/20 bg-primary-200 p-1">
            <Button type="button" size="icon-sm" variant={displayMode === "grid" ? "default" : "ghost"} onClick={() => setDisplayMode("grid")} aria-label="Afficher en grille" aria-pressed={displayMode === "grid"}>
              <Grid2X2 aria-hidden="true" />
            </Button>
            <Button type="button" size="icon-sm" variant={displayMode === "list" ? "default" : "ghost"} onClick={() => setDisplayMode("list")} aria-label="Afficher en liste" aria-pressed={displayMode === "list"}>
              <List aria-hidden="true" />
            </Button>
          </div>
        </div>

        {isEpisodesView && categories.length > 0 ? (
          <div className="mt-5 hidden border-t border-secondary-500/15 pt-5 lg:block">
            <PodcastCategoryFilters categories={categories} selectedCategory={selectedCategory} onSelectCategory={(slug) => updateParams({ categorie: slug })} />
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-secondary-500/15 pt-4">
          <PodcastResultsCount count={resultsCount} noun={isAppearancesView ? "apparition" : isCompilationsView ? "compilation" : "épisode"} />
          {hasActiveFilters ? (
            <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
              <RotateCcw aria-hidden="true" />
              Réinitialiser
            </Button>
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
