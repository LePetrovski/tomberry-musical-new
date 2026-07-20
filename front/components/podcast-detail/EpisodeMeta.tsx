import Link from "next/link";
import type { Podcast, PodcastCategory } from "@/lib/sanity/types";

type Props = {
  podcast: Podcast;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function EpisodeMeta({ podcast }: Props) {
  return (
    <header className="mb-10">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-secondary-600">
        {podcast.episodeNumber && <span>Épisode {podcast.episodeNumber}</span>}
        {podcast.duration && <span>· {podcast.duration}</span>}
        <span>· {formatDate(podcast.publishedAt)}</span>
      </div>

      {podcast.categories && podcast.categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {podcast.categories.map((category: PodcastCategory) => (
            <Link
              key={category._id}
              href={`/podcasts?categorie=${category.slug}`}
              className="rounded-full bg-secondary-500/10 px-2.5 py-0.5 text-xs font-medium leading-[18px] text-secondary-900 transition-colors hover:bg-secondary-500/20"
            >
              {category.title}
            </Link>
          ))}
        </div>
      )}

      <h1 className="text-4xl font-semibold tracking-tight text-secondary-900">{podcast.title}</h1>
      <p
        className="mt-4 text-lg leading-8 text-secondary-700"
        dangerouslySetInnerHTML={{ __html: podcast.description }}
      />
    </header>
  );
}
