import { Suspense } from "react";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { BlogArchive } from "@/components/BlogArchive";
import { client } from "@/lib/sanity/client";
import { postCategoriesQuery, postsQuery } from "@/lib/sanity/queries";
import type { PostCategory, PostPreview } from "@/lib/sanity/types";
import { createPageMetadata } from "@/lib/seo/metadata";
import { collectionPageSchema } from "@/lib/seo/schemas";

const title = "Blog";
const description = "Articles, analyses et coulisses.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  path: "/blog",
});

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([
    client.fetch<PostPreview[]>(postsQuery).catch(() => []),
    client.fetch<PostCategory[]>(postCategoriesQuery).catch(() => []),
  ]);

  return (
    <PageWrapper background="polka" width="wide">
      <JsonLd data={collectionPageSchema({ name: title, description, path: "/blog" })} />
      <Breadcrumbs
        className="mb-8"
        items={[{ label: "Accueil", href: "/" }, { label: title }]}
      />
      <div className="mb-12 max-w-2xl rounded-2xl bg-primary-500 p-6">
        <h1 className="text-4xl font-semibold tracking-tight text-secondary-900">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-secondary-600">{description}</p>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-zinc-100" />}>
        <BlogArchive posts={posts} categories={categories} />
      </Suspense>
    </PageWrapper>
  );
}
