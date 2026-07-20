import Link from "next/link";
import type { PodcastPreview } from "@/lib/sanity/types";

type Props = {
  podcast: PodcastPreview;
};

export function LatestEpisodeCard({ podcast }: Props) {
    return (
        <Link
        href={`/podcasts/${podcast.slug}`}
        className="group mb-10 flex flex-col gap-4 overflow-hidden rounded-2xl border border-secondary-500/20 bg-secondary-100 p-5 transition-all duration-300 hover:border-secondary-500 hover:bg-secondary-500 hover:text-primary-500! md:flex-row "
        >
        <div className="min-w-0">
            <p className="text-lg! font-semibold uppercase tracking-wide text-secondary-500 group-hover:text-primary-500! transition-all duration-300">
            Dernier épisode
            {podcast.episodeNumber ? ` · Épisode ${podcast.episodeNumber}` : ""}
            </p>
            <h3 className="mt-2 text-2xl! font-semibold text-secondary-900 group-hover:text-primary-500! transition-all duration-300">
            {podcast.title}
            </h3>
            <p
            className="mt-2 line-clamp-2 text-sm leading-6 text-secondary-600 group-hover:text-primary-500! transition-all duration-300"
            dangerouslySetInnerHTML={{ __html: podcast.description }}
            />
        </div>
        </Link>
    );
}
