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
      className="group grid min-h-full overflow-hidden rounded-[1.75rem] border border-primary-500/15 bg-secondary-800 text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tertiary-500 sm:grid-cols-[minmax(0,1fr)_150px] lg:grid-cols-[minmax(0,1fr)_140px]"
    >
      <div className="flex min-w-0 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-0 bg-tertiary-500 text-secondary-900">Dernière compilation</Badge>
          <Badge className="border-primary-500/20 bg-primary-500/10 text-primary-500">
            <ListMusic aria-hidden="true" className="size-3.5" />
            {compilation.tracks.length}
          </Badge>
        </div>
        {compilation.curatorName ? (
          <p className="mt-4 text-xs font-medium text-secondary-200">
            Sélection de {compilation.curatorName}
          </p>
        ) : null}
        <h2 className="mt-2 text-xl! font-semibold leading-tight">{compilation.title}</h2>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-secondary-200">
          Écouter
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </span>
      </div>
      <div className="relative min-h-44 overflow-hidden bg-secondary-700 sm:min-h-full">
        <Image
          src={urlFor(compilation.coverImage).width(500).height(500).url()}
          alt={compilation.coverImage.alt ?? compilation.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(max-width: 640px) 100vw, 160px"
        />
      </div>
    </CurtainLink>
  );
}
