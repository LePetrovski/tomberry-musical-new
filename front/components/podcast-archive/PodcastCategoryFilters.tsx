import type { PodcastCategory } from "@/lib/sanity/types";
import { Button } from "@/components/ui/button";

type Props = {
  categories: PodcastCategory[];
  selectedCategory: string;
  onSelectCategory: (slug: string | null) => void;
  showPlaylistLink?: boolean;
};

export function PodcastCategoryFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  showPlaylistLink = true,
}: Props) {
  if (categories.length === 0) {
    return null;
  }

  const activeCategory = categories.find((category) => category.slug === selectedCategory);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => onSelectCategory(null)}
          variant="ghost"
          size="sm"
          className="ff-command-button"
          aria-pressed={!selectedCategory}
        >
          Tous
        </Button>
        {categories.map((category) => (
          <Button
            key={category._id}
            type="button"
            onClick={() =>
              onSelectCategory(selectedCategory === category.slug ? null : category.slug)
            }
            variant="ghost"
            size="sm"
            className="ff-command-button"
            aria-pressed={selectedCategory === category.slug}
          >
            {category.title}
            {category.featured ? " ★" : ""}
          </Button>
        ))}
      </div>

      {showPlaylistLink && activeCategory?.youtubePlaylistUrl && (
        <a
          href={activeCategory.youtubePlaylistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ff-menu-list-link text-sm font-medium"
        >
          Voir la playlist YouTube « {activeCategory.title} » →
        </a>
      )}
    </div>
  );
}
