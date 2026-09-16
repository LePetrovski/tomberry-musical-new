import { cache } from "react";
import { withSanityFallback } from "./fallback";
import { sanityFetch } from "./fetch";
import {
  pageBySlugQuery,
  podcastBySlugQuery,
  postBySlugQuery,
  siteSettingsQuery,
  compilationBySlugQuery,
} from "./queries";
import { sanityTags } from "./tags";
import type { Compilation, Page, PodcastDetail, Post, SiteSettings } from "./types";

export const getPostBySlug = cache(async (slug: string) => {
  return withSanityFallback(
    sanityFetch<Post | null>(postBySlugQuery, { slug }, { tags: [sanityTags.posts] }),
    null,
    `getPostBySlug(${slug})`,
  );
});

export const getPodcastBySlug = cache(async (slug: string) => {
  return withSanityFallback(
    sanityFetch<PodcastDetail | null>(
      podcastBySlugQuery,
      { slug },
      { tags: [sanityTags.podcasts] },
    ),
    null,
    `getPodcastBySlug(${slug})`,
  );
});

export const getPageBySlug = cache(async (slug: string) => {
  return withSanityFallback(
    sanityFetch<Page | null>(pageBySlugQuery, { slug }, { tags: [sanityTags.pages] }),
    null,
    `getPageBySlug(${slug})`,
  );
});

export const getSiteSettings = cache(async () => {
  return withSanityFallback(
    sanityFetch<SiteSettings | null>(
      siteSettingsQuery,
      {},
      { tags: [sanityTags.siteSettings] },
    ),
    null,
    "getSiteSettings",
  );
});

export const getCompilationBySlug = cache(async (slug: string) => {
  return withSanityFallback(
    sanityFetch<Compilation | null>(
      compilationBySlugQuery,
      { slug },
      { tags: [sanityTags.compilations] },
    ),
    null,
    `getCompilationBySlug(${slug})`,
  );
});
