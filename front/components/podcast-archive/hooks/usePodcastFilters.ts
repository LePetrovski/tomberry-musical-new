"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { GuestAppearance, PodcastPreview } from "@/lib/sanity/types";
import { normalizeSearch } from "../utils/normalizeSearch";

export type ArchiveView = "episodes" | "apparitions";

type Params = {
  podcasts: PodcastPreview[];
  appearances: GuestAppearance[];
};

export function usePodcastFilters({ podcasts, appearances }: Params) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategory = searchParams.get("categorie") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
  const selectedView: ArchiveView =
    searchParams.get("vue") === "apparitions" ? "apparitions" : "episodes";
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
        vue: view === "apparitions" ? "apparitions" : null,
        categorie: view === "apparitions" ? null : selectedCategory || null,
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
    });
  }, [podcasts, selectedCategory, searchInput]);

  const filteredAppearances = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchInput);

    if (!normalizedSearch) {
      return appearances;
    }

    return appearances.filter((appearance) => {
      return (
        normalizeSearch(appearance.episodeTitle).includes(normalizedSearch) ||
        normalizeSearch(appearance.showName).includes(normalizedSearch) ||
        normalizeSearch(appearance.platform ?? "").includes(normalizedSearch)
      );
    });
  }, [appearances, searchInput]);

  const hasActiveFilters =
    selectedView === "apparitions"
      ? Boolean(searchInput)
      : Boolean(selectedCategory || searchInput);

  return {
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
  };
}
