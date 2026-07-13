import type { PodcastCategory } from "@/lib/sanity/types";

type Props = {
  categories: PodcastCategory[];
  selectedCategory: string;
  onSelectCategory: (slug: string | null) => void;
};

function filterButtonClass(isActive: boolean) {
  return `rounded-full px-4 py-1.5 text-sm font-medium transition cursor-pointer ${
    isActive
      ? "bg-secondary-500 text-white"
      : "border border-zinc-300 bg-white text-secondary-700 hover:border-zinc-400"
  }`;
}

export function PodcastCategoryFilters({
  categories,
  selectedCategory,
  onSelectCategory,
}: Props) {
  if (categories.length === 0) {
    return null;
  }

  const activeCategory = categories.find((category) => category.slug === selectedCategory);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSelectCategory(null)}
          className={filterButtonClass(!selectedCategory)}
        >
          Tous
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            onClick={() =>
              onSelectCategory(selectedCategory === category.slug ? null : category.slug)
            }
            className={filterButtonClass(selectedCategory === category.slug)}
          >
            {category.title}
            {category.featured ? " ★" : ""}
          </button>
        ))}
      </div>

      {activeCategory?.youtubePlaylistUrl && (
        <a
          href={activeCategory.youtubePlaylistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm font-medium text-secondary-700 transition-colors hover:text-secondary-900"
        >
          Voir la playlist YouTube « {activeCategory.title} » →
        </a>
      )}
    </div>
  );
}
