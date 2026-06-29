import type { PortableTextBlock } from "@portabletext/types";

export type SanityImage = {
  asset: { _ref: string };
  alt?: string;
};

export type Podcast = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: SanityImage;
  episodeNumber?: number;
  duration?: string;
  audioUrl?: string;
  publishedAt: string;
  body?: PortableTextBlock[];
};

export type Post = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: SanityImage;
  author?: string;
  publishedAt: string;
  body: PortableTextBlock[];
};

export type PodcastPreview = Pick<
  Podcast,
  | "_id"
  | "title"
  | "slug"
  | "description"
  | "coverImage"
  | "episodeNumber"
  | "duration"
  | "publishedAt"
>;

export type PostPreview = Pick<
  Post,
  "_id" | "title" | "slug" | "excerpt" | "coverImage" | "author" | "publishedAt"
>;
