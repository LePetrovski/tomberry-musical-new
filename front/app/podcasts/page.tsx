import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { PodcastArchive } from "@/components/PodcastArchive";
import { ElsewhereLinks } from "@/components/podcast-archive/ElsewhereLinks";
import { LatestCompilationCard } from "@/components/podcast-archive/LatestCompilationCard";
import { LatestEpisodeCard } from "@/components/podcast-archive/LatestEpisodeCard";
import { LatestGuestAppearanceCard } from "@/components/podcast-archive/LatestGuestAppearanceCard";
import { Skeleton } from "@/components/ui/skeleton";
import { getSiteSettings } from "@/lib/sanity/cached";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import {
  compilationsQuery,
  guestAppearancesQuery,
  podcastCategoriesQuery,
  podcastsQuery,
} from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import type {
  CompilationPreview,
  GuestAppearance,
  PodcastCategory,
  PodcastPreview,
} from "@/lib/sanity/types";
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
  const [podcasts, categories, guestAppearances, compilations, siteSettings] =
    await Promise.all([
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
      withSanityFallback(
        sanityFetch<CompilationPreview[]>(
          compilationsQuery,
          {},
          { tags: [sanityTags.compilations] },
        ),
        [],
        "PodcastsPage.compilations",
      ),
      getSiteSettings(),
    ]);

  const latestEpisode = podcasts[0];
  const latestGuestAppearance = guestAppearances[0];
  const latestCompilation = compilations[0];

  return (
    <PageWrapper background="polka" width="wide">
      <JsonLd data={collectionPageSchema({ name: title, description, path: "/podcasts" })} />
      <Breadcrumbs
        className="mb-6"
        items={[{ label: "Accueil", href: "/" }, { label: title }]}
      />

      <section className="mb-10">
        <div className="crt-glass grid gap-6 rounded-2xl p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <header className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary-600">
              Le Tomberry Musical
            </p>
            <h1 className="mt-2 mb-0! text-4xl! font-semibold tracking-[-0.04em] text-secondary-900 sm:text-5xl!">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-base! leading-7 text-secondary-700">
              {description}
            </p>
          </header>

          <dl className="grid grid-cols-3 gap-4 border-t border-secondary-500/20 pt-4 lg:border-t-0 lg:pt-0">
            <div className="border-l border-secondary-500/25 pl-3 sm:pl-4">
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-secondary-600">Épisodes</dt>
              <dd className="mt-0.5 text-2xl! font-semibold text-secondary-900">{podcasts.length}</dd>
            </div>
            <div className="border-l border-secondary-500/25 pl-3 sm:pl-4">
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-secondary-600">Apparitions</dt>
              <dd className="mt-0.5 text-2xl! font-semibold text-secondary-900">{guestAppearances.length}</dd>
            </div>
            <div className="border-l border-secondary-500/25 pl-3 sm:pl-4">
              <dt className="text-[0.68rem] uppercase tracking-[0.14em] text-secondary-600">Compilations</dt>
              <dd className="mt-0.5 text-2xl! font-semibold text-secondary-900">{compilations.length}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {latestEpisode ? (
            <div className="xl:col-span-2">
              <LatestEpisodeCard podcast={latestEpisode} />
            </div>
          ) : null}
          {latestGuestAppearance ? <LatestGuestAppearanceCard appearance={latestGuestAppearance} /> : null}
          {latestCompilation ? <LatestCompilationCard compilation={latestCompilation} /> : null}
        </div>
      </section>

      <Suspense fallback={<Skeleton className="h-72 rounded-2xl bg-secondary-100" />}>
        <PodcastArchive
          podcasts={podcasts}
          categories={categories}
          appearances={guestAppearances}
          compilations={compilations}
        />
      </Suspense>

      <ElsewhereLinks links={siteSettings?.featuredLinks} />
    </PageWrapper>
  );
}
