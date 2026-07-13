import Link from "next/link";
import Image from "next/image";
import type { PodcastPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  podcast: PodcastPreview;
};

export function LatestEpisodeCard({ podcast }: Props) {
  return (
    <Link
      href={`/podcasts/${podcast.slug}`}
      className="group mb-10 flex flex-col gap-4 overflow-hidden rounded-2xl border border-secondary-500/20 bg-primary-500 p-5 transition-colors hover:border-secondary-500 md:flex-row"
    >
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-zinc-100 md:h-32 md:w-48">
        {podcast.coverImage ? (
          <Image
            src={urlFor(podcast.coverImage).width(640).height(400).url()}
            alt={podcast.coverImage.alt ?? podcast.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 192px"
          />
        ) : null}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
          Dernier épisode
          {podcast.episodeNumber ? ` · Épisode ${podcast.episodeNumber}` : ""}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-secondary-900 group-hover:text-secondary-700">
          {podcast.title}
        </h2>
        <p
          className="mt-2 line-clamp-2 text-sm leading-6 text-secondary-600"
          dangerouslySetInnerHTML={{ __html: podcast.description }}
        />
      </div>
    </Link>
  );
}
