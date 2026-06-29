import type { Metadata } from "next";
import { PodcastCard } from "@/components/PodcastCard";
import { client } from "@/lib/sanity/client";
import { podcastsQuery } from "@/lib/sanity/queries";
import type { PodcastPreview } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Podcasts",
  description: "Tous les épisodes du podcast.",
};

export default async function PodcastsPage() {
  const podcasts = await client.fetch<PodcastPreview[]>(podcastsQuery).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Podcasts</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">
          Retrouvez l&apos;ensemble des épisodes, du plus récent au plus ancien.
        </p>
      </div>

      {podcasts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast._id} podcast={podcast} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-zinc-600">
          Aucun podcast publié pour le moment.
        </p>
      )}
    </div>
  );
}
