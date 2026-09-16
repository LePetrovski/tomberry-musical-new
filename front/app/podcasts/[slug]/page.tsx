import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { EpisodeMeta } from "@/components/podcast-detail/EpisodeMeta";
import { ListenPanel } from "@/components/podcast-detail/ListenPanel";
import { PodcastHero } from "@/components/podcast-detail/PodcastHero";
import { PurchaseCTA } from "@/components/podcast-detail/PurchaseCTA";
import { ReviewCTA } from "@/components/podcast-detail/ReviewCTA";
import { RelatedPodcastsCarousel } from "@/components/podcast-detail/RelatedPodcastsCarousel";
import { RichText } from "@/components/RichText";
import { getPodcastBySlug, getSiteSettings } from "@/lib/sanity/cached";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import { podcastSlugsQuery } from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import { getOgImageUrl } from "@/lib/seo/images";
import { urlFor } from "@/lib/sanity/image";
import { createPageMetadata } from "@/lib/seo/metadata";
import { podcastEpisodeSchema } from "@/lib/seo/schemas";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    const slugs = await withSanityFallback(
        sanityFetch<string[]>(podcastSlugsQuery, {}, { tags: [sanityTags.podcasts] }),
        [],
        "podcast generateStaticParams",
    );
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const podcast = await getPodcastBySlug(slug);

    if (!podcast) {
        return { title: "Podcast introuvable" };
    }

    return createPageMetadata({
        title: podcast.title,
        description: podcast.description,
        path: `/podcasts/${slug}`,
        image: getOgImageUrl(podcast.coverImage),
        type: "article",
        publishedTime: podcast.publishedAt,
        modifiedTime: podcast._updatedAt ?? podcast.publishedAt,
    });
}

export default async function PodcastDetailPage({ params }: Props) {
    const { slug } = await params;
    const [podcast, siteSettings] = await Promise.all([
        getPodcastBySlug(slug),
        getSiteSettings(),
    ]);

    if (!podcast) {
        notFound();
    }

    const ogImage = getOgImageUrl(podcast.coverImage);
    const heroImage = podcast.coverImage
        ? urlFor(podcast.coverImage).width(1800).url()
        : undefined;
    const heroImagePosition = podcast.coverImage?.hotspot
        ? `${podcast.coverImage.hotspot.x * 100}% ${podcast.coverImage.hotspot.y * 100}%`
        : "50% 50%";

    return (
        <PageWrapper background="cross" width="wide">
            <article>
                <JsonLd data={podcastEpisodeSchema(podcast, ogImage)} />
                <Breadcrumbs
                    className="ff-menu-window ff-archive-window ff-archive-breadcrumb mb-6"
                    items={[
                    { label: "Accueil", href: "/" },
                    { label: "Podcasts", href: "/podcasts" },
                    { label: podcast.title },
                    ]}
                />
                <PodcastHero
                    imageUrl={heroImage}
                    imageAlt={podcast.coverImage?.alt ?? podcast.title}
                    imagePosition={heroImagePosition}
                >
                    <EpisodeMeta podcast={podcast} />
                </PodcastHero>

                <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)] lg:items-start">
                    <div className="space-y-4 lg:sticky lg:top-28 lg:col-start-2 lg:row-start-2">
                        <ListenPanel podcast={podcast} />
                        <PurchaseCTA purchaseLinks={podcast.purchaseLinks} />
                        <ReviewCTA reviewLinks={siteSettings?.reviewLinks} />
                    </div>

                    {podcast.body && podcast.body.length > 0 && (
                        <section className="ff-menu-window ff-archive-window rounded-2xl p-4 sm:p-6 lg:col-start-1 lg:row-start-2">
                            <p className="ff-archive-kicker text-sm font-semibold uppercase tracking-[0.18em]">Pour aller plus loin</p>
                            <h2 className="ff-archive-title mt-2 text-3xl! font-semibold tracking-tight">Notes de l&apos;épisode</h2>
                            <div className="ff-reading-panel prose prose-zinc mt-6 max-w-none rounded-xl p-5 text-secondary-800 sm:p-7">
                                <RichText value={podcast.body} />
                            </div>
                        </section>
                    )}
                </div>

                <RelatedPodcastsCarousel podcasts={podcast.relatedPodcasts ?? []} />
            </article>
        </PageWrapper>
    );
}
