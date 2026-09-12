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
      className="ff-feature-card group grid h-full min-h-56 overflow-hidden rounded-2xl sm:grid-cols-[minmax(0,1.2fr)_minmax(160px,.8fr)]"
    >
      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          <Badge className="border-0 bg-tertiary-500 text-secondary-900">Dernier épisode</Badge>
          {podcast.episodeNumber ? <Badge variant="secondary" className="border border-primary-200/20 bg-primary-200/10 text-primary-200">Épisode {podcast.episodeNumber}</Badge> : null}
          {podcast.duration ? <Badge variant="secondary" className="border border-primary-200/20 bg-primary-200/10 text-primary-200">{podcast.duration}</Badge> : null}
        </div>
        <h2 className="ff-archive-title mt-4 mb-0! line-clamp-2 text-2xl! font-semibold leading-tight tracking-tight">{podcast.title}</h2>
        <p className="ff-archive-copy mt-3 line-clamp-2 text-sm! leading-6" dangerouslySetInnerHTML={{ __html: podcast.description }} />
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary-200">
          Écouter le dernier épisode
          <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
      <div className="ff-feature-image relative min-h-52 overflow-hidden border-t-2 sm:min-h-full sm:border-t-0 sm:border-l-2">
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
          <div className="flex h-full items-center justify-center text-sm font-medium text-secondary-200">Sans visuel</div>
        )}
      </div>
    </CurtainLink>
  );
}
