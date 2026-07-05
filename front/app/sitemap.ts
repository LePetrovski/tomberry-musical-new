import type { MetadataRoute } from "next";
import { client } from "@/lib/sanity/client";
import { podcastSlugsQuery, postSlugsQuery } from "@/lib/sanity/queries";
import { getSiteUrl } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postSlugs, podcastSlugs] = await Promise.all([
    client.fetch<string[]>(postSlugsQuery).catch(() => []),
    client.fetch<string[]>(podcastSlugsQuery).catch(() => []),
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
  ];
}
