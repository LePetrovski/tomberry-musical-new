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
    <Card className="group h-full gap-0 overflow-hidden rounded-[1.5rem] border-0 bg-primary-500 py-0 ring-1 ring-secondary-500/15 transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(39,62,63,0.14)] hover:ring-secondary-500/45">
      <article className="h-full">
        <CurtainLink
          href={`/podcasts/${podcast.slug}`}
          className={`flex h-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500 ${
            isList ? "flex-col sm:flex-row" : "flex-col"
          }`}
        >
          <div
            className={`relative shrink-0 overflow-hidden bg-secondary-100 ${
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

          <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-secondary-600">
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

            {podcast.categories && podcast.categories.length > 0 ? (
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

            <h2 className="mt-4 text-2xl! font-semibold leading-tight text-secondary-900 transition-colors group-hover:text-secondary-700">
              {podcast.title}
            </h2>

            <p
              className={`mt-3 text-base! leading-7 text-secondary-600 ${isList ? "" : "line-clamp-3"}`}
              dangerouslySetInnerHTML={{ __html: podcast.description }}
            />

            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary-800">
              Découvrir l&apos;épisode
              <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
            </span>
          </div>
        </CurtainLink>
      </article>
    </Card>
  );
}
