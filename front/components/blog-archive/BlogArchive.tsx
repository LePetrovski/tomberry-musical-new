"use client";

import type { PostCategory, PostPreview } from "@/lib/sanity/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BlogArchiveGrid } from "./BlogArchiveGrid";
import { BlogResultsCount } from "./BlogResultsCount";
import { BlogSearchInput } from "./BlogSearchInput";
import { useBlogFilters } from "./hooks/useBlogFilters";

type Props = {
  posts: PostPreview[];
  categories: PostCategory[];
};

export function BlogArchive({ posts, categories }: Props) {
  const {
    selectedCategory,
    searchInput,
    setSearchInput,
    filteredPosts,
    hasActiveFilters,
    isPending,
    updateParams,
  } = useBlogFilters({ posts });

  return (
    <div className={isPending ? "opacity-70 transition-opacity" : undefined}>
      <div className="crt-glass z-20 mb-6 flex flex-col gap-2 rounded-2xl p-2.5 sm:flex-row sm:items-center lg:sticky lg:top-24">
        <div className="min-w-0 flex-1">
          <BlogSearchInput value={searchInput} onChange={setSearchInput} />
        </div>

        {categories.length > 0 ? (
          <>
            <label className="sr-only" htmlFor="blog-category">
              Filtrer par catégorie
            </label>
            <Select
              value={selectedCategory || "all"}
              onValueChange={(value) =>
                updateParams({ categorie: value === "all" ? null : value })
              }
            >
              <SelectTrigger
                id="blog-category"
                className="h-10 w-full rounded-xl border-secondary-500/25 bg-primary-200/80 px-3 text-secondary-900 sm:w-48"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-secondary-500/20 bg-primary-200 text-secondary-900">
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category.slug}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ) : null}

        <div className="shrink-0 px-2">
          <BlogResultsCount count={filteredPosts.length} />
        </div>
      </div>

      <BlogArchiveGrid posts={filteredPosts} hasActiveFilters={hasActiveFilters} />
    </div>
  );
}
