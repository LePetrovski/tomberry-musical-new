import type { Metadata } from "next";
import { CalendarDays, ListMusic, UserRound } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { CompilationTurntablePlayer } from "@/components/compilation/CompilationTurntablePlayer";
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
  const coverImageUrl = urlFor(compilation.coverImage).width(1000).height(1000).url();

  return (
    <PageWrapper background="cross" width="wide">
      <article>
        <JsonLd data={musicPlaylistSchema(compilation, imageUrl)} />
        <Breadcrumbs
          className="ff-menu-window ff-archive-window ff-archive-breadcrumb mb-6"
          items={[
            { label: "Accueil", href: "/" },
            { label: "Compilations", href: "/podcasts?vue=compilations" },
            { label: compilation.title },
          ]}
        />

        <header className="ff-menu-window ff-archive-window mb-6 rounded-2xl p-5 sm:p-7 lg:flex lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0">
            <Badge className="border-0 bg-tertiary-500 text-secondary-900">Compilation</Badge>
            <h1 className="ff-archive-title mt-4 mb-0! max-w-5xl text-4xl! font-semibold leading-[1.04] tracking-[-0.04em] sm:text-5xl! lg:text-6xl!">
              {compilation.title}
            </h1>
          </div>
          <div className="mt-5 flex shrink-0 flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-secondary-200 lg:mt-0 lg:justify-end">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays aria-hidden="true" className="size-4" />
              <time dateTime={compilation.publishedAt}>{formatDate(compilation.publishedAt)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ListMusic aria-hidden="true" className="size-4" />
              {compilation.tracks.length} piste{compilation.tracks.length === 1 ? "" : "s"}
            </span>
            {compilation.curatorName ? (
              <span className="inline-flex items-center gap-1.5">
                <UserRound aria-hidden="true" className="size-4" />
                Sélection de {compilation.curatorName}
              </span>
            ) : null}
          </div>
        </header>

        <CompilationTurntablePlayer
          audioUrl={compilation.audioFile.asset.url}
          title={compilation.title}
          coverImageUrl={coverImageUrl}
          coverImageAlt={compilation.coverImage.alt ?? compilation.title}
          tracks={compilation.tracks}
        />

        {compilation.introduction && compilation.introduction.length > 0 ? (
          <section className="ff-reading-panel mx-auto mt-8 max-w-5xl rounded-2xl p-5 sm:p-7 lg:p-9">
            <p className="text-xs! font-semibold uppercase tracking-[0.18em] text-secondary-500">
              À propos de la sélection
            </p>
            <div className="prose prose-zinc mt-5 max-w-[72ch] text-secondary-800">
              <RichText value={compilation.introduction} />
            </div>
          </section>
        ) : null}
      </article>
    </PageWrapper>
  );
}
