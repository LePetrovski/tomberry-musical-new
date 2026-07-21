import type { MetadataRoute } from "next";
import { sanityFetch } from "@/lib/sanity/fetch";
import { pageSlugsQuery, podcastSlugsQuery, postSlugsQuery } from "@/lib/sanity/queries";
import { sanityTags } from "@/lib/sanity/tags";
import { getSiteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postSlugs, podcastSlugs, pageSlugs] = await Promise.all([
    sanityFetch<string[]>(postSlugsQuery, {}, { tags: [sanityTags.posts] }).catch(() => []),
    sanityFetch<string[]>(podcastSlugsQuery, {}, { tags: [sanityTags.podcasts] }).catch(() => []),
    sanityFetch<string[]>(pageSlugsQuery, {}, { tags: [sanityTags.pages] }).catch(() => []),
  ]);

  const base = getSiteUrl();

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/podcasts`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${base}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...podcastSlugs.map((slug) => ({
      url: `${base}/podcasts/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...postSlugs.map((slug) => ({
      url: `${base}/blog/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...pageSlugs.map((slug) => ({
      url: `${base}/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
