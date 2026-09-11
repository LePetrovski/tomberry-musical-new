"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { CompilationPreview, GuestAppearance, PodcastPreview } from "@/lib/sanity/types";
import { normalizeSearch } from "../utils/normalizeSearch";

export type ArchiveView = "episodes" | "apparitions" | "compilations";
export type ArchiveSort = "recent" | "oldest" | "az";

type Params = {
  podcasts: PodcastPreview[];
  appearances: GuestAppearance[];
  compilations: CompilationPreview[];
};

export function usePodcastFilters({ podcasts, appearances, compilations }: Params) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategory = searchParams.get("categorie") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
  const viewParam = searchParams.get("vue");
  const selectedView: ArchiveView =
    viewParam === "apparitions" || viewParam === "compilations" ? viewParam : "episodes";
  const selectedSort: ArchiveSort =
    searchParams.get("tri") === "ancien"
      ? "oldest"
      : searchParams.get("tri") === "az"
        ? "az"
        : "recent";
  const [searchInput, setSearchInput] = useState(searchQuery);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `/podcasts?${query}` : "/podcasts", { scroll: false });
      });
    },
    [router, searchParams],
  );

  const setView = useCallback(
    (view: ArchiveView) => {
      updateParams({
        vue: view === "episodes" ? null : view,
        categorie: view === "episodes" ? selectedCategory || null : null,
      });
    },
    [selectedCategory, updateParams],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateParams({ q: searchInput || null });
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchQuery, updateParams]);

  const filteredPodcasts = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchInput);

    return podcasts.filter((podcast) => {
      const matchesCategory =
        !selectedCategory ||
        podcast.categories?.some((category) => category.slug === selectedCategory);

      const matchesSearch =
        !normalizedSearch ||
        normalizeSearch(podcast.title).includes(normalizedSearch) ||
        normalizeSearch(podcast.description).includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (selectedSort === "az") {
        return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      }

      const dateDifference = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      if (dateDifference !== 0) {
        return selectedSort === "oldest" ? dateDifference : -dateDifference;
      }

      return (b.episodeNumber ?? 0) - (a.episodeNumber ?? 0);
    });
  }, [podcasts, selectedCategory, selectedSort, searchInput]);

  const filteredAppearances = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchInput);

    return appearances.filter((appearance) => {
      return (
        !normalizedSearch ||
        normalizeSearch(appearance.episodeTitle).includes(normalizedSearch) ||
        normalizeSearch(appearance.showName).includes(normalizedSearch) ||
        normalizeSearch(appearance.platform ?? "").includes(normalizedSearch)
      );
    }).sort((a, b) => {
      if (selectedSort === "az") {
        return a.episodeTitle.localeCompare(b.episodeTitle, "fr", { sensitivity: "base" });
      }

      if (!a.publishedAt && !b.publishedAt) return 0;
      if (!a.publishedAt) return 1;
      if (!b.publishedAt) return -1;
      const dateDifference = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      return selectedSort === "oldest" ? dateDifference : -dateDifference;
    });
  }, [appearances, searchInput, selectedSort]);

  const filteredCompilations = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchInput);

    return compilations.filter((compilation) => {
      const searchableTracks = compilation.tracks
        .map((track) => `${track.artist} ${track.title}`)
        .join(" ");

      return (
        !normalizedSearch ||
        normalizeSearch(compilation.title).includes(normalizedSearch) ||
        normalizeSearch(compilation.introText).includes(normalizedSearch) ||
        normalizeSearch(compilation.curatorName ?? "").includes(normalizedSearch) ||
        normalizeSearch(searchableTracks).includes(normalizedSearch)
      );
    }).sort((a, b) => {
      if (selectedSort === "az") {
        return a.title.localeCompare(b.title, "fr", { sensitivity: "base" });
      }

      const dateDifference = new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
      return selectedSort === "oldest" ? dateDifference : -dateDifference;
    });
  }, [compilations, searchInput, selectedSort]);

  const hasActiveFilters =
    selectedView === "episodes"
      ? Boolean(selectedCategory || searchInput || selectedSort !== "recent")
      : Boolean(searchInput || selectedSort !== "recent");

  return {
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
  };
}
