import { cache } from "react";
import { client } from "./client";
import { pageBySlugQuery, podcastBySlugQuery, postBySlugQuery } from "./queries";
import type { Page, Podcast, Post } from "./types";

export const getPostBySlug = cache(async (slug: string) => {
    return client.fetch<Post | null>(postBySlugQuery, { slug }).catch(() => null);
});

export const getPodcastBySlug = cache(async (slug: string) => {
    return client.fetch<Podcast | null>(podcastBySlugQuery, { slug }).catch(() => null);
});

export const getPageBySlug = cache(async (slug: string) => {
    return client.fetch<Page | null>(pageBySlugQuery, { slug }).catch(() => null);
});
