import { ArrowUpRight, CalendarDays, ListMusic, UserRound } from "lucide-react";
import Image from "next/image";
import { CurtainLink } from "@/components/navigation/CurtainLink";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { CompilationPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  compilation: CompilationPreview;
  variant?: "grid" | "list";
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function CompilationCard({ compilation, variant = "grid" }: Props) {
  const isList = variant === "list";

  return (
    <Card className="crt-card group h-full gap-0 overflow-hidden rounded-2xl py-0 transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(39,62,63,0.14)]">
      <article className="h-full">
        <CurtainLink
          href={`/compilations/${compilation.slug}`}
          className={`flex h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500 ${
            isList ? "flex-col sm:flex-row" : "flex-col"
          }`}
        >
          <div
            className={`relative shrink-0 overflow-hidden bg-secondary-100 ${
              isList ? "aspect-square sm:w-64" : "aspect-square"
            }`}
          >
            <Image
              src={urlFor(compilation.coverImage).width(900).height(900).url()}
              alt={compilation.coverImage.alt ?? compilation.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes={
                isList
                  ? "(max-width: 640px) 100vw, 256px"
                  : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              }
            />
            <Badge className="absolute left-4 top-4 border-0 bg-tertiary-500 text-secondary-900">
              Compilation
            </Badge>
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-4.5 sm:p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-secondary-600">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="size-3.5" />
                {formatDate(compilation.publishedAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ListMusic aria-hidden="true" className="size-3.5" />
                {compilation.tracks.length} piste{compilation.tracks.length === 1 ? "" : "s"}
              </span>
              {compilation.curatorName ? (
                <span className="inline-flex items-center gap-1.5">
                  <UserRound aria-hidden="true" className="size-3.5" />
                  {compilation.curatorName}
                </span>
              ) : null}
            </div>

            <h3 className="mt-3.5 mb-0! text-xl! font-semibold leading-tight text-secondary-900 transition-colors group-hover:text-secondary-700">
              {compilation.title}
            </h3>

            {compilation.introText ? (
              <p className={`mt-2.5 text-sm! leading-6 text-secondary-600 ${isList ? "" : "line-clamp-3"}`}>
                {compilation.introText}
              </p>
            ) : null}

            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-secondary-800">
              Écouter la compilation
              <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </span>
          </div>
        </CurtainLink>
      </article>
    </Card>
  );
}
