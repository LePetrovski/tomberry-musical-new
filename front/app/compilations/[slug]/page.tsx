import type { Metadata } from "next";
import Image from "next/image";
import { CalendarDays, ListMusic, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { PodcastMp3Player } from "@/components/podcast-detail/PodcastMp3Player";
import { RichText } from "@/components/RichText";
import { Badge } from "@/components/ui/badge";
import { getCompilationBySlug } from "@/lib/sanity/cached";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import { urlFor } from "@/lib/sanity/image";
import { compilationSlugsQuery } from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import { getOgImageUrl } from "@/lib/seo/images";
import { createPageMetadata } from "@/lib/seo/metadata";
import { musicPlaylistSchema } from "@/lib/seo/schemas";

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

function getDescription(title: string, introText: string) {
  const normalized = introText.replace(/\s+/g, " ").trim();
  if (!normalized) return `${title}, une compilation du Tomberry Musical.`;
  return normalized.length > 200 ? `${normalized.slice(0, 197).trimEnd()}…` : normalized;
}

export async function generateStaticParams() {
  const slugs = await withSanityFallback(
    sanityFetch<string[]>(
      compilationSlugsQuery,
      {},
      { tags: [sanityTags.compilations] },
    ),
    [],
    "compilation generateStaticParams",
  );

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const compilation = await getCompilationBySlug(slug);

  if (!compilation) return { title: "Compilation introuvable" };

  return createPageMetadata({
    title: compilation.title,
    description: getDescription(compilation.title, compilation.introText),
    path: `/compilations/${slug}`,
    image: getOgImageUrl(compilation.coverImage),
    type: "article",
    publishedTime: compilation.publishedAt,
    modifiedTime: compilation._updatedAt ?? compilation.publishedAt,
    authors: compilation.curatorName ? [compilation.curatorName] : undefined,
  });
}

export default async function CompilationDetailPage({ params }: Props) {
  const { slug } = await params;
  const compilation = await getCompilationBySlug(slug);

  if (!compilation) notFound();

  const imageUrl = getOgImageUrl(compilation.coverImage);

  return (
    <PageWrapper background="cross" width="wide">
      <article>
        <JsonLd data={musicPlaylistSchema(compilation, imageUrl)} />
        <Breadcrumbs
          className="mb-8"
          items={[
            { label: "Accueil", href: "/" },
            { label: "Podcasts", href: "/podcasts?vue=compilations" },
            { label: compilation.title },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(280px,.72fr)_minmax(0,1.28fr)] lg:items-start">
          <section className="overflow-hidden rounded-[2rem] bg-primary-500 shadow-[0_20px_65px_rgba(39,62,63,0.12)] ring-1 ring-secondary-500/15">
            <div className="relative aspect-square overflow-hidden bg-secondary-100">
              <Image
                src={urlFor(compilation.coverImage).width(1000).height(1000).url()}
                alt={compilation.coverImage.alt ?? compilation.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 36vw"
              />
            </div>
            <header className="p-6 sm:p-8">
              <Badge className="border-0 bg-tertiary-500 text-secondary-900">Compilation</Badge>
              <h1 className="mt-5 text-4xl! font-semibold leading-[1.06] tracking-[-0.035em] text-secondary-900 sm:text-5xl!">
                {compilation.title}
              </h1>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-secondary-600">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden="true" className="size-4" />
                  <time dateTime={compilation.publishedAt}>{formatDate(compilation.publishedAt)}</time>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ListMusic aria-hidden="true" className="size-4" />
                  {compilation.tracks.length} piste{compilation.tracks.length === 1 ? "" : "s"}
                </span>
              </div>
              {compilation.curatorName ? (
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-secondary-800">
                  <UserRound aria-hidden="true" className="size-4" />
                  Sélection de {compilation.curatorName}
                </p>
              ) : null}
            </header>
          </section>

          <div className="space-y-6">
            {compilation.introduction && compilation.introduction.length > 0 ? (
              <section className="rounded-[2rem] bg-primary-500 p-6 shadow-[0_16px_55px_rgba(39,62,63,0.10)] ring-1 ring-secondary-500/15 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-secondary-500">
                  À propos de la sélection
                </p>
                <div className="prose prose-zinc mt-5 max-w-[70ch] text-secondary-800">
                  <RichText value={compilation.introduction} />
                </div>
              </section>
            ) : null}

            <section aria-label="Écouter la compilation">
              <PodcastMp3Player
                audioUrl={compilation.audioFile.asset.url}
                title={compilation.title}
                tracks={compilation.tracks}
                contentLabel="Compilation MP3"
              />
            </section>
          </div>
        </div>
      </article>
    </PageWrapper>
  );
}
