import Image from "next/image";
import { CalendarDays, Clock3 } from "lucide-react";
import { urlFor } from "@/lib/sanity/image";
import type { Post } from "@/lib/sanity/types";
import { siteConfig } from "@/lib/seo/site";
import styles from "./BlogPost.module.css";
import { ArticleShare } from "./ArticleShare";

type Props = {
  post: Pick<Post, "title" | "excerpt" | "coverImage" | "categories" | "author" | "publishedAt">;
  readingMinutes: number | null;
  canonicalUrl: string;
};

export function BlogPostHero({ post, readingMinutes, canonicalUrl }: Props) {
  const cover = post.coverImage;
  const date = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(post.publishedAt));

  return (
    <header className={styles.hero}>
      {cover ? (
        <div className={`ff-media-well ${styles.cover}`}>
          <Image
            src={urlFor(cover).width(1800).url()}
            alt={cover.alt ?? post.title}
            fill
            preload
            className="object-cover"
            style={{
              objectPosition: cover.hotspot
                ? `${cover.hotspot.x * 100}% ${cover.hotspot.y * 100}%`
                : "50% 50%",
            }}
            sizes="(max-width: 1023px) calc(100vw - 48px), (max-width: 1500px) calc(100vw - 80px), 1420px"
          />
          <div aria-hidden="true" className={styles.coverShade} />
        </div>
      ) : null}

      <div className={`ff-menu-window ff-archive-window ${styles.heroPanel} ${cover ? styles.overlap : ""}`}>
        {post.categories && post.categories.length > 0 ? (
          <div className={styles.categories}>
            {post.categories.map((category) => (
              <span key={category._id} className={styles.category}>
                {category.title}
              </span>
            ))}
          </div>
        ) : null}
        <h1 id="article-title" tabIndex={-1} className={`ff-archive-title ${styles.title}`}>{post.title}</h1>
        {post.excerpt ? <p className={`ff-archive-copy ${styles.excerpt}`}>{post.excerpt}</p> : null}
        <div className={styles.metadata}>
          <span>Par {post.author || siteConfig.host.name}</span>
          <time dateTime={post.publishedAt} className="inline-flex items-center gap-2">
            <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
            {date}
          </time>
          {readingMinutes !== null ? (
            <span className="inline-flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-4 shrink-0" />
              Environ {readingMinutes} min de lecture
            </span>
          ) : null}
        </div>
        <ArticleShare key={canonicalUrl} title={post.title} url={canonicalUrl} />
      </div>
    </header>
  );
}
