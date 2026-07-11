import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { RichText } from "@/components/RichText";
import { getPostBySlug } from "@/lib/sanity/cached";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { postSlugsQuery } from "@/lib/sanity/queries";
import { getOgImageUrl } from "@/lib/seo/images";
import { createPageMetadata } from "@/lib/seo/metadata";
import { articleSchema } from "@/lib/seo/schemas";

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
    modifiedTime: post.publishedAt,
    authors: post.author ? [post.author] : undefined,
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
    <article className="mx-auto max-w-3xl px-6 py-16">
      <JsonLd data={articleSchema(post, ogImage)} />
      <Breadcrumbs
        className="mb-8"
        items={[
          { label: "Accueil", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />
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
