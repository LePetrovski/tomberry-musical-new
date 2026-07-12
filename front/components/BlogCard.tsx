import Image from "next/image";
import { CurtainLink } from "@/components/navigation/CurtainLink";
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
      <CurtainLink href={`/blog/${post.slug}`} className="flex flex-1 flex-col">
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
            <div className="flex h-full items-center justify-center text-sm text-secondary-400">
              Sans visuel
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-secondary-500">
              {post.author ? `Par ${post.author}` : "Article"}
            </div>
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.categories.map((category) => (
                  <span
                    key={category._id}
                    className="rounded-full bg-secondary-500/10 px-2.5 py-0.5 text-xs font-medium leading-[18px] text-secondary-900"
                  >
                    {category.title}
                  </span>
                ))}
              </div>
            )}
          </div>
          <h2 className="text-lg font-semibold text-secondary-900 group-hover:text-secondary-700">
            {post.title}
          </h2>
          <p className="line-clamp-3 text-sm leading-6 text-secondary-600">{post.excerpt}</p>
          <time className="mt-auto text-xs text-secondary-400" dateTime={post.publishedAt}>
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </CurtainLink>
    </article>
  );
}
