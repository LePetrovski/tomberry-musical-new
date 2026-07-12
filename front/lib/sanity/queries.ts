import type {
  Podcast,
  PodcastCategory,
  PodcastPreview,
  Post,
  PostCategory,
  PostPreview,
} from "./types";

const podcastPreviewFields = `
  _id,
  title,
  "slug": slug.current,
  description,
  coverImage,
  episodeNumber,
  duration,
  publishedAt,
  soundcloud,
  embedSoundcloud,
  "categories": categories[]->{ _id, title, "slug": slug.current }
`;

const podcastFields = `
  _id,
  title,
  "slug": slug.current,
  description,
  coverImage,
  episodeNumber,
  duration,
  audioUrl,
  soundcloud,
  embedSoundcloud,
  youtube,
  embedYoutube,
  publishedAt,
  body,
  "categories": categories[]->{ _id, title, "slug": slug.current }
`;

const postContentFields = `
  content[] {
    _type,
    _key,
    _type == "postTextBlock" => {
      content
    },
    _type == "postImageBlock" => {
      image,
      fullWidth,
      caption
    },
    _type == "postTextImageBlock" => {
      content,
      image,
      imagePosition
    }
  }
`;

const postFields = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  author,
  publishedAt,
  "categories": categories[]->{ _id, title, "slug": slug.current },
  ${postContentFields},
  body
`;

export const podcastsQuery = `*[_type == "podcast"] | order(episodeNumber desc) {
  ${podcastPreviewFields}
}`;

export const podcastCategoriesQuery = `*[_type == "podcastCategory"] | order(title asc) {
  _id,
  title,
  "slug": slug.current
}`;

export const podcastBySlugQuery = `*[_type == "podcast" && slug.current == $slug][0] {
  ${podcastFields}
}`;

export const podcastSlugsQuery = `*[_type == "podcast" && defined(slug.current)][].slug.current`;

export const postCategoriesQuery = `*[_type == "postCategory"] | order(title asc) {
  _id,
  title,
  "slug": slug.current
}`;

export const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  author,
  publishedAt,
  "categories": categories[]->{ _id, title, "slug": slug.current }
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

export const siteSettingsQuery = `*[_type == "siteSettings"][0] {
  socialLinks[] {
    name,
    icon,
    url
  }
}`;

export type { Podcast, PodcastCategory, PodcastPreview, Post, PostCategory, PostPreview };
