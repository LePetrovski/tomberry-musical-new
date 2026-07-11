import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
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
    <article className="mx-auto max-w-3xl px-6 py-16">
      <JsonLd data={podcastEpisodeSchema(podcast, ogImage)} />
      <Breadcrumbs
        className="mb-8"
        items={[
          { label: "Accueil", href: "/" },
          { label: "Podcasts", href: "/podcasts" },
          { label: podcast.title },
        ]}
      />
      <header className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          {podcast.episodeNumber && <span>Épisode {podcast.episodeNumber}</span>}
          {podcast.duration && <span>· {podcast.duration}</span>}
          <span>· {formatDate(podcast.publishedAt)}</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{podcast.title}</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">{podcast.description}</p>
      </header>

      {podcast.coverImage && (
        <div className="relative mb-10 aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
          <Image
            src={urlFor(podcast.coverImage).width(1200).height(750).url()}
            alt={podcast.coverImage.alt ?? podcast.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {podcast.audioUrl && (
        <div className="mb-10 rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
          <p className="mb-3 text-sm font-medium text-zinc-700">Écouter l&apos;épisode</p>
          <audio controls className="w-full" src={podcast.audioUrl}>
            Votre navigateur ne supporte pas la lecture audio.
          </audio>
        </div>
      )}

      {podcast.body && podcast.body.length > 0 && (
        <div className="prose prose-zinc max-w-none">
          <RichText value={podcast.body} />
        </div>
      )}
    </article>
  );
}
