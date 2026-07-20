import Image from "next/image";
import type { GuestAppearance } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  appearances: GuestAppearance[];
  hasActiveFilters: boolean;
};

export function GuestAppearancesGrid({ appearances, hasActiveFilters }: Props) {
  if (appearances.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-secondary-600">
        {hasActiveFilters
          ? "Aucune apparition ne correspond à votre recherche."
          : "Aucune apparition publiée pour le moment."}
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {appearances.map((appearance) => (
        <a
          key={appearance._id}
          href={appearance.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex gap-4 rounded-2xl border border-zinc-200 bg-primary-500 p-4 transition-colors hover:border-secondary-500"
        >
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
            {appearance.coverImage ? (
              <Image
                src={urlFor(appearance.coverImage).width(160).height(160).url()}
                alt={appearance.coverImage.alt ?? appearance.episodeTitle}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-secondary-400">
                Podcast
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-secondary-500">
              {appearance.showName}
              {appearance.platform ? ` · ${appearance.platform}` : ""}
            </p>
            <h3 className="mt-1 text-base font-semibold text-secondary-900 group-hover:text-secondary-700">
              {appearance.episodeTitle}
            </h3>
          </div>
        </a>
      ))}
    </div>
  );
}
