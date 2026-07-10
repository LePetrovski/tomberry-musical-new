import type { Podcast, PodcastPreview, Post, PostPreview } from "./types";

const podcastFields = `
  _id,
  title,
  "slug": slug.current,
  description,
  coverImage,
  episodeNumber,
  duration,
  audioUrl,
  publishedAt,
  body
`;

const postFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  author,
  publishedAt,
  body
`;

export const podcastsQuery = `*[_type == "podcast"] | order(episodeNumber desc) {
  _id,
  title,
  "slug": slug.current,
  description,
  coverImage,
  episodeNumber,
  duration,
  publishedAt
}`;

export const podcastBySlugQuery = `*[_type == "podcast" && slug.current == $slug][0] {
  ${podcastFields}
}`;

export const podcastSlugsQuery = `*[_type == "podcast" && defined(slug.current)][].slug.current`;

export const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  author,
  publishedAt
}`;

export const postBySlugQuery = `*[_type == "post" && slug.current == $slug][0] {
  ${postFields}
}`;

export const postSlugsQuery = `*[_type == "post" && defined(slug.current)][].slug.current`;

const pageFields = `
  _id,
  title,
  "slug": slug.current,
  description,
  coverImage,
  body,
  _updatedAt
`;

export const pageBySlugQuery = `*[_type == "page" && slug.current == $slug][0] {
  ${pageFields}
}`;

export const pageSlugsQuery = `*[_type == "page" && defined(slug.current)][].slug.current`;

export const latestPodcastsQuery = `*[_type == "podcast"] | order(publishedAt desc)[0...3] {
  _id,
  title,
  "slug": slug.current,
  description,
  coverImage,
  episodeNumber,
  duration,
  publishedAt
}`;

export const latestPostsQuery = `*[_type == "post"] | order(publishedAt desc)[0...3] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  author,
  publishedAt
}`;

export type { Podcast, PodcastPreview, Post, PostPreview };
