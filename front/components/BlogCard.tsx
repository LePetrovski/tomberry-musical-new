import Image from "next/image";
import { ArrowUpRight, BookOpen, CalendarDays } from "lucide-react";
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
    <article className="ff-content-card group overflow-hidden rounded-2xl">
      <CurtainLink
        href={`/blog/${post.slug}`}
        className="flex min-w-0 flex-col rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-secondary-500 md:flex-row"
      >
        <div className="relative aspect-16/10 shrink-0 overflow-hidden border-b-2 border-secondary-800/50 bg-secondary-100 md:aspect-auto md:min-h-72 md:w-70 md:border-r-2 md:border-b-0 lg:w-80">
          {post.coverImage ? (
            <Image
              src={urlFor(post.coverImage).width(960).height(600).url()}
              alt={post.coverImage.alt ?? post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 767px) calc(100vw - 52px), (max-width: 1023px) 280px, 320px"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-linear-to-br from-secondary-100 to-secondary-200 p-6 text-secondary-500">
              <BookOpen aria-hidden="true" className="size-10 stroke-1" />
              <span className="text-sm">Sans visuel</span>
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-6 lg:p-8">
          {post.categories && post.categories.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.categories.map((category) => (
                <span
                  key={category._id}
                  className="ff-compact-theme max-w-full rounded-full px-3 py-1 text-xs font-medium wrap-anywhere"
                >
                  {category.title}
                </span>
              ))}
            </div>
          )}
          <h2 className="mb-0! text-[22px]! leading-snug! font-semibold text-secondary-900! wrap-anywhere group-hover:text-secondary-700! lg:text-[28px]!">
            {post.title}
          </h2>
          <p className="mt-4 max-w-prose text-[16px]! leading-7 text-secondary-600 wrap-anywhere">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-secondary-800/15 pt-4 text-sm text-secondary-600">
            <time className="inline-flex items-center gap-2" dateTime={post.publishedAt}>
              <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
              {formatDate(post.publishedAt)}
            </time>
            {post.author ? <span className="wrap-anywhere">Par {post.author}</span> : null}
          </div>
          <span className="ff-card-action mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold">
            Lire l’article
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        </div>
      </CurtainLink>
    </article>
  );
}
