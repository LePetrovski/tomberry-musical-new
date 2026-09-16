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
  const activeCategory = categories.find((category) => category.slug === selectedCategory);

  return (
    <div>
      <div className="ff-menu-window ff-archive-window ff-command-bar z-20 mb-8 p-6 lg:sticky! lg:top-24">
        <div className="flex flex-col gap-5 md:flex-row md:items-end">
          <div className="min-w-0 flex-1">
            <BlogSearchInput value={searchInput} onChange={setSearchInput} />
          </div>

          {categories.length > 0 ? (
            <div className="min-w-0 md:w-64 md:shrink-0">
              <label className="mb-2 block text-sm font-medium text-primary-200" htmlFor="blog-category">
                Catégorie
              </label>
              <Select
                value={selectedCategory || "all"}
                onValueChange={(value) =>
                  updateParams({ categorie: value === "all" ? null : value })
                }
              >
                <SelectTrigger
                  id="blog-category"
                  className="ff-command-field h-12! w-full px-4 text-[16px] motion-reduce:transition-none"
                >
                  <SelectValue>
                    {() => activeCategory?.title ?? "Toutes catégories"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="ff-select-popup">
                  <SelectItem className="ff-select-item min-h-11" value="all">
                    Toutes catégories
                  </SelectItem>
                  {categories.map((category) => (
                    <SelectItem className="ff-select-item min-h-11" key={category._id} value={category.slug}>
                      {category.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <div className="mt-5 border-t border-secondary-200/25 pt-4">
          <BlogResultsCount count={filteredPosts.length} />
        </div>
      </div>

      <div aria-busy={isPending} className={`transition-opacity motion-reduce:transition-none ${isPending ? "opacity-70" : "opacity-100"}`}>
        <BlogArchiveGrid posts={filteredPosts} hasActiveFilters={hasActiveFilters} />
      </div>
    </div>
  );
}
