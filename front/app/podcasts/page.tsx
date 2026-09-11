import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { ElsewhereLinks } from "@/components/podcast-archive/ElsewhereLinks";
import { LatestEpisodeCard } from "@/components/podcast-archive/LatestEpisodeCard";
import { LatestGuestAppearanceCard } from "@/components/podcast-archive/LatestGuestAppearanceCard";
import { LatestCompilationCard } from "@/components/podcast-archive/LatestCompilationCard";
import { PodcastArchive } from "@/components/PodcastArchive";
import { Skeleton } from "@/components/ui/skeleton";
import { getSiteSettings } from "@/lib/sanity/cached";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import {
  guestAppearancesQuery,
  compilationsQuery,
  podcastCategoriesQuery,
  podcastsQuery,
} from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import type { CompilationPreview, GuestAppearance, PodcastCategory, PodcastPreview } from "@/lib/sanity/types";
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
  const [podcasts, categories, guestAppearances, compilations, siteSettings] = await Promise.all([
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
        className="mb-8"
        items={[{ label: "Accueil", href: "/" }, { label: title }]}
      />
      <section className="mb-14 overflow-hidden rounded-[2rem] bg-secondary-900 p-5 text-primary-500 shadow-[0_24px_80px_rgba(11,22,23,0.18)] sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <header className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-tertiary-500">Le Tomberry Musical</p>
            <h1 className="mt-3 text-6xl! font-semibold tracking-[-0.04em] text-primary-500">{title}</h1>
            <p className="mt-5 text-lg! leading-8 text-secondary-200">{description}</p>
          </header>
          <dl className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-primary-500/15 bg-primary-500/5 px-5 py-4">
              <dt className="text-xs uppercase tracking-[0.14em] text-secondary-200">Épisodes</dt>
              <dd className="mt-1 text-3xl! font-semibold text-primary-500">{podcasts.length}</dd>
            </div>
            <div className="rounded-2xl border border-primary-500/15 bg-primary-500/5 px-5 py-4">
              <dt className="text-xs uppercase tracking-[0.14em] text-secondary-200">Apparitions</dt>
              <dd className="mt-1 text-3xl! font-semibold text-primary-500">{guestAppearances.length}</dd>
            </div>
            <div className="rounded-2xl border border-primary-500/15 bg-primary-500/5 px-5 py-4">
              <dt className="text-xs uppercase tracking-[0.14em] text-secondary-200">Compilations</dt>
              <dd className="mt-1 text-3xl! font-semibold text-primary-500">{compilations.length}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,.7fr)]">
          {latestEpisode && <LatestEpisodeCard podcast={latestEpisode} />}
          {(latestGuestAppearance || latestCompilation) && (
            <div className="grid gap-5">
              {latestGuestAppearance && <LatestGuestAppearanceCard appearance={latestGuestAppearance} />}
              {latestCompilation && <LatestCompilationCard compilation={latestCompilation} />}
            </div>
          )}
        </div>
      </section>

      <Suspense fallback={<Skeleton className="h-96 rounded-[2rem] bg-secondary-100" />}>
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
