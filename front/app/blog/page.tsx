import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
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
    <PageWrapper background="polka" width="wide">
      <JsonLd data={collectionPageSchema({ name: title, description, path: "/blog" })} />
      <Breadcrumbs
        className="mb-6"
        items={[{ label: "Accueil", href: "/" }, { label: title }]}
      />
      <PageHero title={title} description={description} className="mb-8 max-w-3xl" />

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-zinc-100" />}>
        <BlogArchive posts={posts} categories={categories} />
      </Suspense>
    </PageWrapper>
  );
}
