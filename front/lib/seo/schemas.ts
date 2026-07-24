import type { Page, Podcast, Post } from "@/lib/sanity/types";
import { absoluteUrl, getSiteUrl, siteConfig } from "./site";

export type BreadcrumbItem = {
  label: string;
  /** Omit on the current page (last item). */
  href?: string;
};

type SchemaOptions = {
  sameAs?: string[];
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

export function personSchema(name?: string) {
  const personName = name?.trim() || siteConfig.host.name;

  return {
    "@type": "Person" as const,
    name: personName,
    ...(personName === siteConfig.host.name
      ? {
          description: siteConfig.host.description,
          url: getSiteUrl(),
        }
      : {}),
  };
}

export function organizationSchema({ sameAs = [] }: SchemaOptions = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/icon"),
    },
    image: absoluteUrl("/opengraph-image"),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function webSiteSchema({ sameAs = [] }: SchemaOptions = {}) {
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
      url: getSiteUrl(),
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function podcastSeriesSchema({ sameAs = [] }: SchemaOptions = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "PodcastSeries",
    name: siteConfig.name,
    url: absoluteUrl("/podcasts"),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    image: absoluteUrl("/opengraph-image"),
    webFeed: absoluteUrl("/podcasts"),
    author: personSchema(),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
    ...(sameAs.length ? { sameAs } : {}),
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
  const dateModified = post._updatedAt ?? post.publishedAt;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified,
    inLanguage: siteConfig.language,
    author: personSchema(post.author),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: getSiteUrl(),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${post.slug}`),
    },
  };
}

export function podcastEpisodeSchema(podcast: Podcast, imageUrl?: string) {
  const dateModified = podcast._updatedAt ?? podcast.publishedAt;

  return {
    "@context": "https://schema.org",
    "@type": "PodcastEpisode",
    name: podcast.title,
    description: podcast.description,
    datePublished: podcast.publishedAt,
    dateModified,
    url: absoluteUrl(`/podcasts/${podcast.slug}`),
    inLanguage: siteConfig.language,
    author: personSchema(),
    ...(podcast.episodeNumber ? { episodeNumber: podcast.episodeNumber } : {}),
    ...(imageUrl ? { image: [imageUrl] } : {}),
    partOfSeries: {
      "@type": "PodcastSeries",
      name: siteConfig.name,
      url: absoluteUrl("/podcasts"),
      description: siteConfig.description,
    },
    ...(podcast.audioFile?.asset?.url || podcast.audioUrl
      ? {
          associatedMedia: {
            "@type": "MediaObject",
            contentUrl: podcast.audioFile?.asset?.url ?? podcast.audioUrl,
            encodingFormat: podcast.audioFile?.asset?.mimeType ?? "audio/mpeg",
          },
        }
      : {}),
  };
}

export function webPageSchema(page: Page, imageUrl?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: absoluteUrl(`/${page.slug}`),
    inLanguage: siteConfig.language,
    dateModified: page._updatedAt,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
  };
}
