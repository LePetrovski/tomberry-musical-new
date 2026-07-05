import { cache } from "react";
import { client } from "./client";
import { podcastBySlugQuery, postBySlugQuery } from "./queries";
import type { Podcast, Post } from "./types";

export const getPostBySlug = cache(async (slug: string) => {
  return client.fetch<Post | null>(postBySlugQuery, { slug }).catch(() => null);
});

export const getPodcastBySlug = cache(async (slug: string) => {
  return client.fetch<Podcast | null>(podcastBySlugQuery, { slug }).catch(() => null);
});
