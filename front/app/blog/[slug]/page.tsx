import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@/components/RichText";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { postBySlugQuery, postSlugsQuery } from "@/lib/sanity/queries";
import type { Post } from "@/lib/sanity/types";

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
  const slugs = await client.fetch<string[]>(postSlugsQuery).catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch<Post | null>(postBySlugQuery, { slug }).catch(() => null);

  if (!post) {
    return { title: "Article introuvable" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await client.fetch<Post | null>(postBySlugQuery, { slug }).catch(() => null);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <div className="mb-4 text-sm text-zinc-500">
          {post.author && <span>Par {post.author} · </span>}
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">{post.title}</h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">{post.excerpt}</p>
      </header>

      {post.coverImage && (
        <div className="relative mb-10 aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100">
          <Image
            src={urlFor(post.coverImage).width(1200).height(750).url()}
            alt={post.coverImage.alt ?? post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      <div className="prose prose-zinc max-w-none">
        <RichText value={post.body} />
      </div>
    </article>
  );
}
