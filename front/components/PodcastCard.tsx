import Image from "next/image";
import Link from "next/link";
import type { PodcastPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  	podcast: PodcastPreview;
};

function formatDate(date: string) {
	return new Intl.DateTimeFormat("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(date));
}

export function PodcastCard({ podcast }: Props) {
	return (
		<article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-primary-500 shadow-sm transition hover:-translate-y-2 hover:shadow-md h-20 aspect-square">
			<div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
				<div>
				{podcast.coverImage ? (
					<Image
					src={urlFor(podcast.coverImage).width(800).height(500).url()}
					alt={podcast.coverImage.alt ?? podcast.title}
					fill
					className="object-cover"
					sizes="(max-width: 768px) 100vw, 33vw"
					draggable={false}
					/>
				) : (
					<div className="flex h-full items-center justify-center text-sm text-zinc-400">
					Sans visuel
					</div>
				)}
				</div>

				<Link href={`/podcasts/${podcast.slug}`} className="flex flex-1 flex-col">

				<div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
					{podcast.episodeNumber && <span>Épisode {podcast.episodeNumber}</span>}
					{podcast.duration && <span>· {podcast.duration}</span>}
				</div>
				<h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">
					{podcast.title}
				</h2>
				</Link>

			</div>
		</article>
	);
}
