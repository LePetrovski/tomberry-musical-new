import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { CurtainLink } from "@/components/navigation/CurtainLink";
import { Badge } from "@/components/ui/badge";
import type { PodcastPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = { podcast: PodcastPreview };

export function LatestEpisodeCard({ podcast }: Props) {
  return (
    <CurtainLink
      href={`/podcasts/${podcast.slug}`}
      className="group grid min-h-full overflow-hidden rounded-[1.75rem] bg-primary-500 text-secondary-900 shadow-[0_20px_60px_rgba(11,22,23,0.2)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-500 sm:grid-cols-[minmax(0,1.25fr)_minmax(180px,.75fr)]"
    >
      <div className="flex min-w-0 flex-col p-6 sm:p-8">
        <div className="flex flex-wrap gap-2">
          <Badge className="border-0 bg-tertiary-500 text-secondary-900">Dernier épisode</Badge>
          {podcast.episodeNumber ? <Badge variant="secondary" className="border-0 bg-secondary-100 text-secondary-900">Épisode {podcast.episodeNumber}</Badge> : null}
          {podcast.duration ? <Badge variant="secondary" className="border-0 bg-secondary-100 text-secondary-900">{podcast.duration}</Badge> : null}
        </div>
        <h2 className="mt-5 text-3xl! font-semibold leading-tight tracking-tight">{podcast.title}</h2>
        <p className="mt-4 text-base! leading-7 text-secondary-600" dangerouslySetInnerHTML={{ __html: podcast.description }} />
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-secondary-800">
          Écouter le dernier épisode
          <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
      <div className="relative min-h-64 overflow-hidden bg-secondary-100 sm:min-h-full">
        {podcast.coverImage ? (
          <Image
            src={urlFor(podcast.coverImage).width(900).height(900).url()}
            alt={podcast.coverImage.alt ?? podcast.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 640px) 100vw, 40vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-secondary-500">Sans visuel</div>
        )}
      </div>
    </CurtainLink>
  );
}
