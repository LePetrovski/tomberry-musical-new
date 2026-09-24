import { ArrowUpRight, ListMusic } from "lucide-react";
import Image from "next/image";
import { CurtainLink } from "@/components/navigation/CurtainLink";
import { Badge } from "@/components/ui/badge";
import type { CompilationPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = { compilation: CompilationPreview };

export function LatestCompilationCard({ compilation }: Props) {
  return (
    <CurtainLink
      href={`/compilations/${compilation.slug}`}
      className="ff-feature-card group grid h-full min-h-56 overflow-hidden rounded-2xl sm:grid-cols-[minmax(0,1fr)_120px] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_110px]"
    >
      <div className="flex min-w-0 flex-col p-4.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-0 bg-tertiary-500 text-secondary-900">Dernière compilation</Badge>
          <Badge className="border-primary-500/20 bg-primary-500/10 text-primary-500">
            <ListMusic aria-hidden="true" className="size-3.5" />
            {compilation.tracks.length}
          </Badge>
        </div>
        {compilation.curatorName ? (
          <p className="ff-archive-kicker mt-3 text-xs font-medium">
            Sélection de {compilation.curatorName}
          </p>
        ) : null}
        <h2 className="ff-archive-title mt-2 mb-0! line-clamp-2 text-lg! font-semibold leading-tight">{compilation.title}</h2>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-primary-200">
          Écouter
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </span>
      </div>
      <div className="ff-feature-image relative min-h-36 overflow-hidden border-t-2 sm:min-h-full sm:border-t-0 sm:border-l-2 lg:min-h-28 lg:border-t-2 lg:border-l-0 xl:min-h-full xl:border-t-0 xl:border-l-2">
        <Image
          src={urlFor(compilation.coverImage).width(500).height(500).url()}
          alt={compilation.coverImage.alt ?? compilation.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(max-width: 639px) calc(100vw - 48px), (max-width: 1023px) 120px, (max-width: 1279px) calc(50vw - 48px), 110px"
        />
      </div>
    </CurtainLink>
  );
}
