"use client";

import type { PostCategory, PostPreview } from "@/lib/sanity/types";
import { BlogArchiveGrid } from "./BlogArchiveGrid";
import { BlogCategoryFilters } from "./BlogCategoryFilters";
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
      <div className="bg-primary-500! mb-10 rounded-2xl p-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <BlogSearchInput value={searchInput} onChange={setSearchInput} />
          {hasActiveFilters && <BlogResultsCount count={filteredPosts.length} />}
        </div>

        <BlogCategoryFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(slug) => updateParams({ categorie: slug })}
        />
      </div>

      <BlogArchiveGrid posts={filteredPosts} hasActiveFilters={hasActiveFilters} />
    </div>
  );
}
