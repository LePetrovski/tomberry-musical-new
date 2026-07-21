import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { EpisodeMeta } from "@/components/podcast-detail/EpisodeMeta";
import { ListenPanel } from "@/components/podcast-detail/ListenPanel";
import { ReviewCTA } from "@/components/podcast-detail/ReviewCTA";
import { RichText } from "@/components/RichText";
import { getPodcastBySlug, getSiteSettings } from "@/lib/sanity/cached";
import { sanityFetch } from "@/lib/sanity/fetch";
import { podcastSlugsQuery } from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import { getOgImageUrl } from "@/lib/seo/images";
import { createPageMetadata } from "@/lib/seo/metadata";
import { podcastEpisodeSchema } from "@/lib/seo/schemas";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
    const slugs = await sanityFetch<string[]>(
        podcastSlugsQuery,
        {},
        { tags: [sanityTags.podcasts] },
    ).catch(() => []);
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
        modifiedTime: podcast.publishedAt,
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
                    className="mb-8"
                    items={[
                    { label: "Accueil", href: "/" },
                    { label: "Podcasts", href: "/podcasts" },
                    { label: podcast.title },
                    ]}
                />
                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="mb-10 rounded-2xl bg-primary-500 p-6 lg:w-[60%]">
                        <EpisodeMeta podcast={podcast} />

                        {podcast.body && podcast.body.length > 0 && (
                            <div className="proseprose-secondary max-w-none">
                            <RichText value={podcast.body} />
                            </div>
                        )}
                    </div>

                    <div className="sticky top-30 mb-10 h-fit space-y-6 lg:w-[40%]">
                        <ListenPanel podcast={podcast} />
                        <ReviewCTA reviewLinks={siteSettings?.reviewLinks} />
                    </div>
                </div>
            </article>
        </PageWrapper>
    );
}
