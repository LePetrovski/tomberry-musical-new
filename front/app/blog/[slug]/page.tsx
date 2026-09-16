import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { BlogPostHero } from "@/components/blog-post/BlogPostHero";
import { CurtainLink } from "@/components/navigation/CurtainLink";
import styles from "@/components/blog-post/BlogPost.module.css";
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
import { absoluteUrl, siteConfig } from "@/lib/seo/site";
import { analyzeArticle } from "@/lib/blog/reading";
import { ArticleContents } from "@/components/blog-post/ArticleContents";
import { ArticleProgress } from "@/components/blog-post/ArticleProgress";
import { ArticleAnchor } from "@/components/blog-post/ArticleAnchor";

type Props = {
  params: Promise<{ slug: string }>;
};

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
  const reading = analyzeArticle(post);

  return (
    <PageWrapper background="grid-thin" width="wide">
      <article>
        <JsonLd data={articleSchema(post, ogImage)} />
        <Breadcrumbs
          className="ff-menu-window ff-archive-window ff-archive-breadcrumb mb-8 max-w-full wrap-anywhere"
          items={[
            { label: "Accueil", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]}
        />
        <BlogPostHero post={post} readingMinutes={reading.readingMinutes} canonicalUrl={absoluteUrl(`/blog/${post.slug}`)} />

        {reading.hasContent ? (
          <div className={`ff-reading-panel ${styles.readingPanel}`}>
            <ArticleContents headings={reading.headings} />
            <div id="article-body">
              {post.content && post.content.length > 0 ? (
                <PostContent blocks={post.content} headingIds={reading.contentHeadingIds} />
              ) : post.body?.length ? (
                <div className={styles.richText}>
                  <RichText value={post.body} headingIds={reading.bodyHeadingIds} />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {reading.hasContent ? <ArticleProgress key={post.slug} targetId="article-body" /> : null}

        <footer className="mt-8 flex flex-wrap justify-center gap-4 sm:mt-12">
          <CurtainLink
            href="/blog"
            className="ff-menu-window ff-archive-window inline-flex min-h-12 items-center gap-3 px-6 py-4 text-sm font-semibold text-primary-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Retour au blog
          </CurtainLink>
          <ArticleAnchor id="article-title" className="ff-menu-window ff-archive-window inline-flex min-h-12 items-center gap-3 px-6 py-4 text-sm font-semibold text-primary-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-secondary-500">
            <ArrowUp aria-hidden="true" className="size-4" />
            Retour en haut
          </ArticleAnchor>
        </footer>
      </article>
    </PageWrapper>
  );
}
