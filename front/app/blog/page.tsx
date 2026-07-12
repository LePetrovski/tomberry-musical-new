import type { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageWrapper } from "@/components/PageWrapper";
import { client } from "@/lib/sanity/client";
import { postsQuery } from "@/lib/sanity/queries";
import type { PostPreview } from "@/lib/sanity/types";
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
  const posts = await client.fetch<PostPreview[]>(postsQuery).catch(() => []);

  return (
    <PageWrapper background="grid-thin" width="default">
      <JsonLd data={collectionPageSchema({ name: title, description, path: "/blog" })} />
      <Breadcrumbs
        className="mb-8"
        items={[{ label: "Accueil", href: "/" }, { label: title }]}
      />
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">{description}</p>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-zinc-600">
          Aucun article publié pour le moment.
        </p>
      )}
    </PageWrapper>
  );
}
