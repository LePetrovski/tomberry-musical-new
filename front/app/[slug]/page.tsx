import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { PageWrapper } from "@/components/PageWrapper";
import { RichText } from "@/components/RichText";
import { getPageBySlug } from "@/lib/sanity/cached";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import { pageSlugsQuery } from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import { getOgImageUrl } from "@/lib/seo/images";
import { createPageMetadata } from "@/lib/seo/metadata";
import { webPageSchema } from "@/lib/seo/schemas";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await withSanityFallback(
    sanityFetch<string[]>(pageSlugsQuery, {}, { tags: [sanityTags.pages] }),
    [],
    "page generateStaticParams",
  );
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return { title: "Page introuvable" };
  }

  return createPageMetadata({
    title: page.title,
    description: page.description,
    path: `/${slug}`,
    image: getOgImageUrl(page.coverImage),
  });
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  const ogImage = getOgImageUrl(page.coverImage);

  return (
    <PageWrapper background="polka" width="narrow">
      <article>
        <JsonLd data={webPageSchema(page, ogImage)} />
        <Breadcrumbs
          className="mb-6"
          items={[{ label: "Accueil", href: "/" }, { label: page.title }]}
        />
        <PageHero
          title={page.title}
          description={page.description}
          image={page.coverImage}
          imageAlt={page.coverImage?.alt ?? page.title}
        />
        <div className="crt-card prose prose-zinc max-w-none rounded-2xl p-5 sm:p-7">
          <RichText value={page.body} />
        </div>
      </article>
    </PageWrapper>
  );
}
