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
      className="group grid min-h-full overflow-hidden rounded-[1.75rem] border border-primary-500/15 bg-secondary-800 text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-500 sm:grid-cols-[minmax(0,1fr)_150px] lg:grid-cols-[minmax(0,1fr)_140px]"
    >
      <div className="flex min-w-0 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-0 bg-tertiary-500 text-secondary-900">Dernière apparition</Badge>
          {appearance.platform ? <Badge className="border-primary-500/20 bg-primary-500/10 text-primary-500">{appearance.platform}</Badge> : null}
        </div>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary-200">
          <Radio aria-hidden="true" className="size-4" />
          {appearance.showName}
        </p>
        <h2 className="mt-2 text-xl! font-semibold leading-tight">{appearance.episodeTitle}</h2>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-secondary-200">
          Écouter l&apos;apparition
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </span>
      </div>
      <div className="relative min-h-48 overflow-hidden bg-secondary-700 sm:min-h-full">
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
