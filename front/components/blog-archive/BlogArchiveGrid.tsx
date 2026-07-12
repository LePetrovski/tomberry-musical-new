import { BlogCard } from "@/components/BlogCard";
import type { PostPreview } from "@/lib/sanity/types";

type Props = {
  posts: PostPreview[];
  hasActiveFilters: boolean;
};

export function BlogArchiveGrid({ posts, hasActiveFilters }: Props) {
  if (posts.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-secondary-600">
        {hasActiveFilters
          ? "Aucun article ne correspond à votre recherche."
          : "Aucun article publié pour le moment."}
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  );
}
