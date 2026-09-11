import Link from "next/link";
import type { Podcast, PodcastCategory } from "@/lib/sanity/types";
import { Badge } from "@/components/ui/badge";

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
    <header>
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-500">Le Tomberry Musical</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-secondary-600">
        {podcast.episodeNumber && <Badge className="border-0 bg-secondary-900 text-primary-500">Épisode {podcast.episodeNumber}</Badge>}
        {podcast.duration && <span>{podcast.duration}</span>}
        <span aria-hidden="true">·</span>
        <time dateTime={podcast.publishedAt}>{formatDate(podcast.publishedAt)}</time>
      </div>

      {podcast.categories && podcast.categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {podcast.categories.map((category: PodcastCategory) => (
            <Link
              key={category._id}
              href={`/podcasts?categorie=${category.slug}`}
              className="rounded-full bg-secondary-500/10 px-3 py-1 text-xs font-medium leading-[18px] text-secondary-900 transition-colors hover:bg-secondary-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
            >
              {category.title}
            </Link>
          ))}
        </div>
      )}

      <h1 className="mt-6 text-5xl! font-semibold leading-[1.05] tracking-[-0.035em] text-secondary-900">{podcast.title}</h1>
      <p
        className="mt-6 text-lg! leading-8 text-secondary-700"
        dangerouslySetInnerHTML={{ __html: podcast.description }}
      />
    </header>
  );
}
