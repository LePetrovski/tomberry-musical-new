import { ArrowUpRight, Radio } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { GuestAppearance } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = { appearance: GuestAppearance };

export function LatestGuestAppearanceCard({ appearance }: Props) {
  return (
    <a
      href={appearance.url}
      target="_blank"
      rel="noopener noreferrer"
      className="ff-feature-card group grid h-full min-h-56 overflow-hidden rounded-2xl sm:grid-cols-[minmax(0,1fr)_120px] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_110px]"
    >
      <div className="flex min-w-0 flex-col p-4.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-0 bg-tertiary-500 text-secondary-900">Dernière apparition</Badge>
          {appearance.platform ? <Badge className="border-primary-500/20 bg-primary-500/10 text-primary-500">{appearance.platform}</Badge> : null}
        </div>
        <p className="ff-archive-kicker mt-3 inline-flex items-center gap-2 text-xs font-semibold">
          <Radio aria-hidden="true" className="size-4" />
          {appearance.showName}
        </p>
        <h2 className="ff-archive-title mt-2 mb-0! line-clamp-2 text-lg! font-semibold leading-tight">{appearance.episodeTitle}</h2>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-primary-200">
          Écouter l&apos;apparition
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </span>
      </div>
      <div className="ff-feature-image relative min-h-36 overflow-hidden border-t-2 sm:min-h-full sm:border-t-0 sm:border-l-2 lg:min-h-28 lg:border-t-2 lg:border-l-0 xl:min-h-full xl:border-t-0 xl:border-l-2">
        {appearance.coverImage ? (
          <Image
            src={urlFor(appearance.coverImage).width(600).height(450).url()}
            alt={appearance.coverImage.alt ?? appearance.episodeTitle}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-secondary-200">Podcast</div>
        )}
      </div>
    </a>
  );
}
