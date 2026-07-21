import { cache } from "react";
import { sanityFetch } from "./fetch";
import {
  pageBySlugQuery,
  podcastBySlugQuery,
  postBySlugQuery,
  siteSettingsQuery,
} from "./queries";
import { sanityTags } from "./tags";
import type { Page, Podcast, Post, SiteSettings } from "./types";

export const getPostBySlug = cache(async (slug: string) => {
  return sanityFetch<Post | null>(postBySlugQuery, { slug }, { tags: [sanityTags.posts] }).catch(
    () => null,
  );
});

export const getPodcastBySlug = cache(async (slug: string) => {
  return sanityFetch<Podcast | null>(
    podcastBySlugQuery,
    { slug },
    { tags: [sanityTags.podcasts] },
  ).catch(() => null);
});

export const getPageBySlug = cache(async (slug: string) => {
  return sanityFetch<Page | null>(pageBySlugQuery, { slug }, { tags: [sanityTags.pages] }).catch(
    () => null,
  );
});

export const getSiteSettings = cache(async () => {
  return sanityFetch<SiteSettings | null>(
    siteSettingsQuery,
    {},
    { tags: [sanityTags.siteSettings] },
  ).catch(() => null);
});
