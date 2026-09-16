import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import Image from "next/image";
import { CurtainLink } from "@/components/navigation/CurtainLink";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PodcastPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  podcast: PodcastPreview;
  variant?: "grid" | "list" | "compact";
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function PodcastCard({ podcast, variant = "grid" }: Props) {
  const isList = variant === "list";
  const isCompact = variant === "compact";

  return (
    <Card className={`ff-content-card group h-full gap-0 overflow-hidden rounded-2xl py-0 ${isCompact ? "ff-compact-card" : ""}`} data-view={variant}>
      <article className="h-full">
        <CurtainLink
          href={`/podcasts/${podcast.slug}`}
          className={`flex h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500 ${
            isList ? "flex-col sm:flex-row" : "flex-col"
          }`}
        >
          <div
            className={`ff-card-image relative shrink-0 overflow-hidden bg-secondary-100 ${
              isList ? "aspect-16/10 sm:aspect-auto sm:min-h-56 sm:w-72 lg:w-80" : "aspect-16/10"
            }`}
          >
            {podcast.coverImage ? (
              <Image
                src={urlFor(podcast.coverImage).width(960).height(600).url()}
                alt={podcast.coverImage.alt ?? podcast.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                sizes={
                  isList
                    ? "(max-width: 640px) 100vw, 320px"
                    : "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                }
                draggable={false}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-medium text-secondary-500">
                Sans visuel
              </div>
            )}
            {podcast.episodeNumber ? (
              <Badge className="absolute left-4 top-4 border-0 bg-secondary-900 px-3 py-1 text-primary-500 shadow-sm">
                Épisode {podcast.episodeNumber}
              </Badge>
            ) : null}
          </div>

          <div className={`flex min-w-0 flex-1 flex-col ${isCompact ? "p-4" : "p-4.5 sm:p-5"}`}>
            <div className="ff-card-meta flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-secondary-600">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden="true" className="size-3.5" />
                {formatDate(podcast.publishedAt)}
              </span>
              {podcast.duration ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 aria-hidden="true" className="size-3.5" />
                  {podcast.duration}
                </span>
              ) : null}
            </div>

            {!isCompact && podcast.categories && podcast.categories.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {podcast.categories.map((category) => (
                  <Badge
                    key={category._id}
                    variant="secondary"
                    className="border-0 bg-secondary-500/10 text-secondary-900"
                  >
                    {category.title}
                  </Badge>
                ))}
              </div>
            ) : null}

            {isCompact && podcast.categories?.[0] ? (
              <div className="mt-3">
                <span className="ff-compact-theme inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em]">
                  <span aria-hidden="true" className="ff-compact-theme-mark" />
                  <span className="truncate">Thème · {podcast.categories[0].title}</span>
                </span>
              </div>
            ) : null}

            <h2 className={`${isCompact ? "mt-2.5 text-lg! line-clamp-2" : "mt-3.5 text-xl!"} mb-0! font-semibold leading-tight text-secondary-900 transition-colors group-hover:text-secondary-700`}>
              {podcast.title}
            </h2>

            {!isCompact ? (
              <p
                className={`mt-2.5 text-sm! leading-6 text-secondary-600 ${isList ? "" : "line-clamp-3"}`}
                dangerouslySetInnerHTML={{ __html: podcast.description }}
              />
            ) : null}

            <span className={`ff-card-action inline-flex items-center gap-1.5 text-sm font-semibold ${isCompact ? "mt-auto pt-4" : "mt-4"}`}>
              {isCompact ? "Voir l’épisode" : "Découvrir l’épisode"}
              <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </span>
          </div>
        </CurtainLink>
      </article>
    </Card>
  );
}
