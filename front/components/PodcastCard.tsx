import Image from "next/image";
import Link from "next/link";
import type { PodcastPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  podcast: PodcastPreview;
};

export function PodcastCard({ podcast }: Props) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-primary-500 shadow-sm transition hover:-translate-y-2 hover:shadow-md">
        <Link href={`/podcasts/${podcast.slug}`} className="flex flex-1 flex-col">
            <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
            {podcast.coverImage ? (
                <Image
                src={urlFor(podcast.coverImage).width(800).height(500).url()}
                alt={podcast.coverImage.alt ?? podcast.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                draggable={false}
                />
            ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                Sans visuel
                </div>
            )}
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">

                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {podcast.episodeNumber && <span>Épisode {podcast.episodeNumber}</span>}
                    {podcast.duration && <span>· {podcast.duration}</span>}
                </div>

                {podcast.categories && podcast.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                    {podcast.categories.map((category) => (
                        <span
                        key={category._id}
                        className="rounded-full bg-secondary-500/10 px-2.5 py-0.5 text-xs font-medium text-secondary-900"
                        >
                        {category.title}
                        </span>
                    ))}
                    </div>
                )}

                <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">
                    {podcast.title}
                </h2>

                <p className="line-clamp-2 text-sm leading-6 text-zinc-600">{podcast.description}</p>
            </div>
        </Link>
        </article>
    );
    }
