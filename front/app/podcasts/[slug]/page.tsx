import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { EpisodeMeta } from "@/components/podcast-detail/EpisodeMeta";
import { ListenPanel } from "@/components/podcast-detail/ListenPanel";
import { PurchaseCTA } from "@/components/podcast-detail/PurchaseCTA";
import { ReviewCTA } from "@/components/podcast-detail/ReviewCTA";
import { RelatedPodcastsCarousel } from "@/components/podcast-detail/RelatedPodcastsCarousel";
import { RichText } from "@/components/RichText";
import Image from "next/image";
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

    return (
        <PageWrapper background="cross" width="wide">
            <article>
                <JsonLd data={podcastEpisodeSchema(podcast, ogImage)} />
                <Breadcrumbs
                    className="mb-6"
                    items={[
                    { label: "Accueil", href: "/" },
                    { label: "Podcasts", href: "/podcasts" },
                    { label: podcast.title },
                    ]}
                />
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,.65fr)] lg:items-start">
                    <section className="crt-card overflow-hidden rounded-2xl">
                        <div className="grid md:grid-cols-[minmax(260px,.85fr)_minmax(0,1.15fr)] md:items-stretch">
                            <div className="relative aspect-square min-h-72 overflow-hidden bg-secondary-100 md:aspect-auto md:min-h-[520px]">
                                {podcast.coverImage ? (
                                    <Image
                                        src={urlFor(podcast.coverImage).width(1000).height(1000).url()}
                                        alt={podcast.coverImage.alt ?? podcast.title}
                                        fill
                                        priority
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 38vw"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm font-medium text-secondary-500">Sans visuel</div>
                                )}
                            </div>
                            <div className="flex items-center p-5 sm:p-7 lg:p-8">
                                <EpisodeMeta podcast={podcast} />
                            </div>
                        </div>
                    </section>

                    <div className="space-y-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                        <ListenPanel podcast={podcast} />
                        <PurchaseCTA purchaseLinks={podcast.purchaseLinks} />
                        <ReviewCTA reviewLinks={siteSettings?.reviewLinks} />
                    </div>

                    {podcast.body && podcast.body.length > 0 && (
                        <section className="crt-card rounded-2xl p-5 sm:p-7 lg:col-start-1">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-500">Pour aller plus loin</p>
                            <h2 className="mt-2 text-3xl! font-semibold tracking-tight text-secondary-900">Notes de l&apos;épisode</h2>
                            <div className="prose prose-zinc mt-6 max-w-[70ch] text-secondary-800">
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
