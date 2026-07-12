import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { RichText } from "@/components/RichText";
import { getPodcastBySlug } from "@/lib/sanity/cached";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { podcastSlugsQuery } from "@/lib/sanity/queries";
import { getOgImageUrl } from "@/lib/seo/images";
import { createPageMetadata } from "@/lib/seo/metadata";
import { podcastEpisodeSchema } from "@/lib/seo/schemas";

type Props = {
    params: Promise<{ slug: string }>;
};

function formatDate(date: string) {
    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

export async function generateStaticParams() {
    const slugs = await client.fetch<string[]>(podcastSlugsQuery).catch(() => []);
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
    const podcast = await getPodcastBySlug(slug);

    if (!podcast) {
        notFound();
    }

    const ogImage = getOgImageUrl(podcast.coverImage);

    return (
        <PageWrapper background="grid-thin" width="wide">
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
                <div className="flex flex-col lg:flex-row gap-8">

                    <div className="mb-10 rounded-2xl bg-primary-500 p-6 lg:w-[60%]">
                        <header className="mb-10">
                            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-secondary-500">
                                {podcast.episodeNumber && <span>Épisode {podcast.episodeNumber}</span>}
                                {podcast.duration && <span>· {podcast.duration}</span>}
                                <span>· {formatDate(podcast.publishedAt)}</span>
                            </div>
                            <h1 className="text-4xl font-semibold tracking-tight text-secondary-900">{podcast.title}</h1>
                            <p className="mt-4 text-lg leading-8 text-secondary-600" dangerouslySetInnerHTML={{ __html: podcast.description }} />
                        </header>

                        {podcast.body && podcast.body.length > 0 && (
                            <div className="prose prose-zinc max-w-none">
                            <RichText value={podcast.body} />
                            </div>
                        )}
                    </div>

                    <div className="sticky top-30 mb-10 h-fit rounded-2xl space-y-10 border border-zinc-200 bg-zinc-50 p-6 min-w-0 lg:w-[40%] overflow-hidden">
                        {podcast.embedYoutube && (
                            <div className="">
                                <p className="mb-3 text-sm font-medium text-secondary-700">Voir l&apos;épisode</p>
                                <div
                                    className="relative aspect-video w-full overflow-hidden rounded-2xl bg-secondary-900 [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
                                    dangerouslySetInnerHTML={{ __html: podcast.embedYoutube }}
                                />
                            </div>
                        )}

                        {podcast.embedSoundcloud && (
                            <div className="">
                            <p className="mb-3 text-sm font-medium text-secondary-700">Écouter l&apos;épisode</p>
                            <div
                                className="w-full overflow-hidden rounded-2xl [&_iframe]:h-[166px] [&_iframe]:w-full [&_iframe]:border-0"
                                dangerouslySetInnerHTML={{ __html: podcast.embedSoundcloud }}
                            />
                            </div>
                        )}
                    </div>

                </div>

            </article>
        </PageWrapper>
    );
}
