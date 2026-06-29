import type { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";
import { client } from "@/lib/sanity/client";
import { postsQuery } from "@/lib/sanity/queries";
import type { PostPreview } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles, analyses et coulisses.",
};

export default async function BlogPage() {
  const posts = await client.fetch<PostPreview[]>(postsQuery).catch(() => []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">Blog</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">
          Explorez nos articles pour approfondir les sujets abordés dans le podcast.
        </p>
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
    </div>
  );
}
