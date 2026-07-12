"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PostPreview } from "@/lib/sanity/types";
import { normalizeSearch } from "@/components/podcast-archive/utils/normalizeSearch";

type Params = {
  posts: PostPreview[];
};

export function useBlogFilters({ posts }: Params) {
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
        router.replace(query ? `/blog?${query}` : "/blog", { scroll: false });
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

  const filteredPosts = useMemo(() => {
    const normalizedSearch = normalizeSearch(searchInput);

    return posts.filter((post) => {
      const matchesCategory =
        !selectedCategory ||
        post.categories?.some((category) => category.slug === selectedCategory);

      const matchesSearch =
        !normalizedSearch ||
        normalizeSearch(post.title).includes(normalizedSearch) ||
        normalizeSearch(post.excerpt).includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchInput]);

  const hasActiveFilters = Boolean(selectedCategory || searchInput);

  return {
    selectedCategory,
    searchInput,
    setSearchInput,
    filteredPosts,
    hasActiveFilters,
    isPending,
    updateParams,
  };
}
