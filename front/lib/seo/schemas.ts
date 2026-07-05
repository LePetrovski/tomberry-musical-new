import type { Podcast, Post } from "@/lib/sanity/types";
import { absoluteUrl, getSiteUrl, siteConfig } from "./site";

export type BreadcrumbItem = {
  label: string;
  /** Omit on the current page (last item). */
  href?: string;
};

export function breadcrumbListSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const listItem: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
      };

      if (item.href) {
        listItem.item = absoluteUrl(item.href);
      }

      return listItem;
    }),
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
    },
  };
}

export function collectionPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
  };
}

export function articleSchema(post: Post, imageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: siteConfig.language,
    ...(post.author ? { author: { "@type": "Person", name: post.author } } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
  };
}

export function podcastEpisodeSchema(podcast: Podcast, imageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: podcast.title,
    description: podcast.description,
    datePublished: podcast.publishedAt,
    url: absoluteUrl(`/podcasts/${podcast.slug}`),
    inLanguage: siteConfig.language,
    ...(podcast.episodeNumber ? { episodeNumber: podcast.episodeNumber } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    partOfSeries: {
      "@type": "PodcastSeries",
      name: siteConfig.name,
      url: absoluteUrl("/podcasts"),
    },
    ...(podcast.audioUrl
      ? {
          associatedMedia: {
            "@type": "MediaObject",
            contentUrl: podcast.audioUrl,
            encodingFormat: "audio/mpeg",
          },
        }
      : {}),
  };
}
