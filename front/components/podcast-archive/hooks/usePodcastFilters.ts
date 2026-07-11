"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PodcastPreview } from "@/lib/sanity/types";
import { normalizeSearch } from "../utils/normalizeSearch";

type Params = {
  podcasts: PodcastPreview[];
};

export function usePodcastFilters({ podcasts }: Params) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedCategory = searchParams.get("categorie") ?? "";
  const searchQuery = searchParams.get("q") ?? "";
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

  const hasActiveFilters = Boolean(selectedCategory || searchInput);

  return {
    selectedCategory,
    searchInput,
    setSearchInput,
    filteredPodcasts,
    hasActiveFilters,
    isPending,
    updateParams,
  };
}
