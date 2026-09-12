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
      <p className="ff-archive-kicker text-sm font-semibold uppercase tracking-[0.18em]">Le Tomberry Musical</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-primary-200">
        {podcast.episodeNumber && <Badge className="rounded-md border border-primary-200/25 bg-primary-200/10 text-primary-200">Épisode {podcast.episodeNumber}</Badge>}
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
              className="ff-command-button inline-flex rounded-md px-3 py-1 text-xs font-medium leading-[18px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
            >
              {category.title}
            </Link>
          ))}
        </div>
      )}

      <h1 className="ff-archive-title mt-6 text-4xl! font-semibold leading-[1.05] tracking-[-0.035em] sm:text-5xl!">{podcast.title}</h1>
      <p
        className="ff-archive-copy mt-6 text-lg! leading-8"
        dangerouslySetInnerHTML={{ __html: podcast.description }}
      />
    </header>
  );
}
