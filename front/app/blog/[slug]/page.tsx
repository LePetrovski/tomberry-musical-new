import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { PageWrapper } from "@/components/PageWrapper";
import { PostContent } from "@/components/PostContent";
import { RichText } from "@/components/RichText";
import { getPostBySlug } from "@/lib/sanity/cached";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import { postSlugsQuery } from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import { getOgImageUrl } from "@/lib/seo/images";
import { createPageMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/schemas";
import { siteConfig } from "@/lib/seo/site";

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
  const slugs = await withSanityFallback(
    sanityFetch<string[]>(postSlugsQuery, {}, { tags: [sanityTags.posts] }),
    [],
    "blog generateStaticParams",
  );
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Article introuvable" };
  }

  return createPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    image: getOgImageUrl(post.coverImage),
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post._updatedAt ?? post.publishedAt,
    authors: [post.author || siteConfig.host.name],
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const ogImage = getOgImageUrl(post.coverImage);

  return (
    <PageWrapper background="grid-thin" width="narrow">
      <article>
        <JsonLd data={articleSchema(post, ogImage)} />
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Accueil", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]}
        />
        <PageHero
          title={post.title}
          description={post.excerpt}
          image={post.coverImage}
          imageAlt={post.coverImage?.alt ?? post.title}
        >
          <div className="mb-4 text-sm text-secondary-500">
            <span>Par {post.author || siteConfig.host.name} · </span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          </div>
          {post.categories && post.categories.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <span
                  key={category._id}
                  className="rounded-full bg-secondary-500/10 px-3 py-1 text-xs font-medium text-secondary-900"
                >
                  {category.title}
                </span>
              ))}
            </div>
          ) : null}
        </PageHero>

        <div className="crt-card rounded-2xl p-5 sm:p-7">
          {post.content && post.content.length > 0 ? (
            <PostContent blocks={post.content} />
          ) : post.body ? (
            <div className="prose prose-zinc max-w-none">
              <RichText value={post.body} />
            </div>
          ) : null}
        </div>
      </article>
    </PageWrapper>
  );
}
