import Image from "next/image";
import Link from "next/link";
import type { PodcastPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  podcast: PodcastPreview;
};

export function PodcastCard({ podcast }: Props) {
    return (
        <article className="group relative flex flex-col overflow-hidden transition ">
        <Link href={`/podcasts/${podcast.slug}`} className="flex flex-1 md:flex-col flex-row flex-nowrap max-md:gap-4 space-y-2">

            <div className="flex flex-1 flex-col gap-3 p-5 rounded-2xl border bg-primary-500 shadow-sm max-md:h-full group-hover:border-secondary-500 border-transparent transition-all duration-300">

                <div className="flex flex-row justify-between gap-3">
                    <div className="flex items-center gap-2 text-md! font-medium uppercase tracking-wide text-secondary-500">
                        {podcast.episodeNumber && <span>Épisode {podcast.episodeNumber}</span>}
                        {podcast.duration && <span>· {podcast.duration}</span>}
                    </div>

                    {podcast.categories && podcast.categories.length > 0 && (
                        <div className="flex flex-row flex-wrap gap-1.5">
                        {podcast.categories.map((category) => (
                            <span
                            key={category._id}
                            className="rounded-full bg-secondary-500/10 px-2.5 py-0.5 text-xs font-medium text-secondary-900 leading-[18px]"
                            >
                            {category.title}
                            </span>
                        ))}
                        </div>
                    )}
                </div>

                <h2 className="text-xl! font-semibold text-secondary-900 group-hover:text-secondary-700 max-md:mb-0! transition-all duration-300">
                    {podcast.title}
                </h2>

                <p className="line-clamp-2 text-base!  max-md:hidden leading-6 text-secondary-600" dangerouslySetInnerHTML={{ __html: podcast.description }} />
            </div>

            <div className="relative h-30 max-md:aspect-square overflow-hidden bg-zinc-10 rounded-2xl group-hover:md:-translate-y-2 transition-all duration-300">
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
                <div className="flex h-full items-center justify-center text-sm text-secondary-400">
                Sans visuel
                </div>
            )}
            </div>
        </Link>
        </article>
    );
    }
