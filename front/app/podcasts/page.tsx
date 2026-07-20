import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { ElsewhereLinks } from "@/components/podcast-archive/ElsewhereLinks";
import { LatestEpisodeCard } from "@/components/podcast-archive/LatestEpisodeCard";
import { LatestGuestAppearanceCard } from "@/components/podcast-archive/LatestGuestAppearanceCard";
import { PodcastArchive } from "@/components/PodcastArchive";
import { getSiteSettings } from "@/lib/sanity/cached";
import { client } from "@/lib/sanity/client";
import {
  guestAppearancesQuery,
  podcastCategoriesQuery,
  podcastsQuery,
} from "@/lib/sanity/queries";
import type { GuestAppearance, PodcastCategory, PodcastPreview } from "@/lib/sanity/types";
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
  const [podcasts, categories, guestAppearances, siteSettings] = await Promise.all([
    client.fetch<PodcastPreview[]>(podcastsQuery).catch(() => []),
    client.fetch<PodcastCategory[]>(podcastCategoriesQuery).catch(() => []),
    client.fetch<GuestAppearance[]>(guestAppearancesQuery).catch(() => []),
    getSiteSettings(),
  ]);

  const latestEpisode = podcasts[0];
  const latestGuestAppearance = guestAppearances[0];

  return (
    <PageWrapper background="polka" width="wide">
        <JsonLd data={collectionPageSchema({ name: title, description, path: "/podcasts" })} />
        <Breadcrumbs
            className="mb-8"
            items={[{ label: "Accueil", href: "/" }, { label: title }]}
        />
        <div className="mb-12 max-w-2xl rounded-2xl bg-primary-500 p-6">
            <h1 className="text-4xl font-semibold tracking-tight text-secondary-900">{title}</h1>
            <p className="mt-4 text-lg leading-8 text-secondary-600">{description}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {latestEpisode && <LatestEpisodeCard podcast={latestEpisode} />}
            {latestGuestAppearance && (
              <LatestGuestAppearanceCard appearance={latestGuestAppearance} />
            )}
        </div>

        <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-zinc-100" />}>
            <PodcastArchive
              podcasts={podcasts}
              categories={categories}
              appearances={guestAppearances}
            />
        </Suspense>

        <ElsewhereLinks links={siteSettings?.featuredLinks} />
    </PageWrapper>
  );
}
