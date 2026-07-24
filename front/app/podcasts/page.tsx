import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { PageWrapper } from "@/components/PageWrapper";
import { ElsewhereLinks } from "@/components/podcast-archive/ElsewhereLinks";
import { LatestEpisodeCard } from "@/components/podcast-archive/LatestEpisodeCard";
import { LatestGuestAppearanceCard } from "@/components/podcast-archive/LatestGuestAppearanceCard";
import { PodcastArchive } from "@/components/PodcastArchive";
import { getSiteSettings } from "@/lib/sanity/cached";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import {
  guestAppearancesQuery,
  podcastCategoriesQuery,
  podcastsQuery,
} from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import type { GuestAppearance, PodcastCategory, PodcastPreview } from "@/lib/sanity/types";
import { createPageMetadata } from "@/lib/seo/metadata";
import { collectionPageSchema } from "@/lib/seo/schemas";

const title = "Podcasts";
const description =
  "Tous les épisodes de Le Tomberry Musical, le podcast francophone sur la musique de jeux vidéo.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/podcasts",
});

export default async function PodcastsPage() {
  const [podcasts, categories, guestAppearances, siteSettings] = await Promise.all([
    withSanityFallback(
      sanityFetch<PodcastPreview[]>(podcastsQuery, {}, { tags: [sanityTags.podcasts] }),
      [],
      "PodcastsPage.podcasts",
    ),
    withSanityFallback(
      sanityFetch<PodcastCategory[]>(
        podcastCategoriesQuery,
        {},
        { tags: [sanityTags.podcasts] },
      ),
      [],
      "PodcastsPage.categories",
    ),
    withSanityFallback(
      sanityFetch<GuestAppearance[]>(
        guestAppearancesQuery,
        {},
        { tags: [sanityTags.guestAppearances] },
      ),
      [],
      "PodcastsPage.guestAppearances",
    ),
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
      <PageHero title={title} description={description} className="mb-12 max-w-2xl" />

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
