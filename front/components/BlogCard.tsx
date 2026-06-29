import Image from "next/image";
import Link from "next/link";
import type { PostPreview } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  post: PostPreview;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function BlogCard({ post }: Props) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100">
          {post.coverImage ? (
            <Image
              src={urlFor(post.coverImage).width(800).height(500).url()}
              alt={post.coverImage.alt ?? post.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              Sans visuel
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {post.author ? `Par ${post.author}` : "Article"}
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-zinc-700">
            {post.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-6 text-zinc-600">{post.excerpt}</p>
          <time className="mt-auto text-xs text-zinc-400" dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </Link>
    </article>
  );
}
