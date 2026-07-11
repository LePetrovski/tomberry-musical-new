import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PodcastArchive } from "@/components/PodcastArchive";
import { client } from "@/lib/sanity/client";
import { podcastCategoriesQuery, podcastsQuery } from "@/lib/sanity/queries";
import type { PodcastCategory, PodcastPreview } from "@/lib/sanity/types";
import { createPageMetadata } from "@/lib/seo/metadata";
import { collectionPageSchema } from "@/lib/seo/schemas";

const title = "Podcasts";
const description = "Tous les épisodes du podcast.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/podcasts",
});

export default async function PodcastsPage() {
  const [podcasts, categories] = await Promise.all([
    client.fetch<PodcastPreview[]>(podcastsQuery).catch(() => []),
    client.fetch<PodcastCategory[]>(podcastCategoriesQuery).catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-[1500px] lg:px-10 px-6 pt-30 pb-16">
      <JsonLd data={collectionPageSchema({ name: title, description, path: "/podcasts" })} />
      <Breadcrumbs
        className="mb-8"
        items={[{ label: "Accueil", href: "/" }, { label: title }]}
      />
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">{description}</p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-zinc-100" />}>
        <PodcastArchive podcasts={podcasts} categories={categories} />
      </Suspense>
    </div>
  );
}
