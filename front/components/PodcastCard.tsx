import { ArrowUpRight, CalendarDays, Clock3 } from "lucide-react";
import Image from "next/image";
import { CurtainLink } from "@/components/navigation/CurtainLink";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PodcastPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  podcast: PodcastPreview;
  variant?: "grid" | "list";
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

  return (
    <Card className="ff-content-card group h-full min-w-0 w-full max-w-full gap-0 overflow-hidden rounded-2xl py-0" data-view={variant}>
      <article className="h-full min-w-0 w-full">
        <CurtainLink
          href={`/podcasts/${podcast.slug}`}
          className={`flex h-full min-w-0 w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500 ${
            isList ? "flex-col sm:flex-row" : "flex-col"
          }`}
        >
          <div
            className={`ff-card-image relative w-full shrink-0 overflow-hidden bg-secondary-100 ${
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
              <Badge className="absolute top-4 left-4 h-auto max-w-[calc(100%-2rem)] shrink min-h-5 whitespace-normal border-0 bg-secondary-900 px-3 py-1 text-left text-primary-500 shadow-sm [overflow-wrap:anywhere]">
                Épisode {podcast.episodeNumber}
              </Badge>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-4.5 sm:p-5">
            <div className="ff-card-meta flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-secondary-600">
              <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 [overflow-wrap:anywhere]">
                <CalendarDays aria-hidden="true" className="size-3.5 shrink-0" />
                {formatDate(podcast.publishedAt)}
              </span>
              {podcast.duration ? (
                <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 [overflow-wrap:anywhere]">
                  <Clock3 aria-hidden="true" className="size-3.5 shrink-0" />
                  {podcast.duration}
                </span>
              ) : null}
            </div>

            {podcast.categories && podcast.categories.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {podcast.categories.map((category) => (
                  <Badge
                    key={category._id}
                    variant="secondary"
                    className="h-auto min-h-5 max-w-full shrink whitespace-normal border-0 bg-secondary-500/10 text-left text-secondary-900 [overflow-wrap:anywhere]"
                  >
                    {category.title}
                  </Badge>
                ))}
              </div>
            ) : null}

            <h2 className="mt-3.5 mb-0! text-xl! font-semibold leading-tight text-secondary-900 transition-colors [overflow-wrap:anywhere] group-hover:text-secondary-700">
              {podcast.title}
            </h2>

            <p
              className={`mt-2.5 min-w-0 text-sm! leading-6 text-secondary-600 [overflow-wrap:anywhere] ${isList ? "" : "line-clamp-3"}`}
              dangerouslySetInnerHTML={{ __html: podcast.description }}
            />

            <span className="ff-card-action mt-4 inline-flex max-w-full flex-wrap items-center gap-1.5 text-sm font-semibold">
              Découvrir l’épisode
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </span>
          </div>
        </CurtainLink>
      </article>
    </Card>
  );
}
