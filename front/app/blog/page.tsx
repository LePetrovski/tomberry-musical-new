import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { BlogArchive } from "@/components/BlogArchive";
import { withSanityFallback } from "@/lib/sanity/fallback";
import { sanityFetch } from "@/lib/sanity/fetch";
import { postCategoriesQuery, postsQuery } from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import type { PostCategory, PostPreview } from "@/lib/sanity/types";
import { createPageMetadata } from "@/lib/seo/metadata";
import { collectionPageSchema } from "@/lib/seo/schemas";

const title = "Blog";
const description =
  "Articles et coulisses autour de la musique de jeux vidéo : compositeurs, bandes originales et culture VGM.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/blog",
});

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    withSanityFallback(
      sanityFetch<PostPreview[]>(postsQuery, {}, { tags: [sanityTags.posts] }),
      [],
      "BlogPage.posts",
    ),
    withSanityFallback(
      sanityFetch<PostCategory[]>(postCategoriesQuery, {}, { tags: [sanityTags.posts] }),
      [],
      "BlogPage.categories",
    ),
  ]);

  return (
    <PageWrapper background="polka" width="default">
      <JsonLd data={collectionPageSchema({ name: title, description, path: "/blog" })} />
      <Breadcrumbs
        className="ff-menu-window ff-archive-window ff-archive-breadcrumb mb-8"
        items={[{ label: "Accueil", href: "/" }, { label: title }]}
      />
      <header className="ff-menu-window ff-archive-window mb-8 p-6 sm:mb-10 sm:p-8 lg:p-10">
        <p className="ff-archive-kicker text-xs! font-semibold uppercase tracking-[0.2em]">
          Le Tomberry Musical
        </p>
        <h1 className="ff-archive-title mt-3 mb-0! text-4xl! font-semibold tracking-tight sm:text-5xl!">
          {title}
        </h1>
        <p className="ff-archive-copy mt-5 max-w-2xl text-base! leading-8">
          {description}
        </p>
      </header>

      <Suspense
        fallback={
          <div role="status" aria-label="Chargement des articles" className="space-y-8">
            <div className="ff-menu-window ff-archive-window h-48 animate-pulse motion-reduce:animate-none" />
            <div className="ff-content-card h-80 animate-pulse rounded-2xl motion-reduce:animate-none" />
            <span className="sr-only">Chargement des articles…</span>
          </div>
        }
      >
        <BlogArchive posts={posts} categories={categories} />
      </Suspense>
    </PageWrapper>
  );
}
