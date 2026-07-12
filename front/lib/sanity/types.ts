import type { PortableTextBlock } from "@portabletext/types";

export type SanityImage = {
  asset: { _ref: string };
  alt?: string;
};

export type PodcastCategory = {
  _id: string;
  title: string;
  slug: string;
};

export type PostCategory = {
  _id: string;
  title: string;
  slug: string;
};

export type PostTextBlock = {
  _type: "postTextBlock";
  _key: string;
  content: PortableTextBlock[];
};

export type PostImageBlock = {
  _type: "postImageBlock";
  _key: string;
  image: SanityImage;
  fullWidth?: boolean;
  caption?: string;
};

export type PostTextImageBlock = {
  _type: "postTextImageBlock";
  _key: string;
  content: PortableTextBlock[];
  image: SanityImage;
  imagePosition?: "left" | "right";
};

export type PostContentBlock = PostTextBlock | PostImageBlock | PostTextImageBlock;

export type Podcast = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: SanityImage;
  episodeNumber?: number;
  duration?: string;
  audioUrl?: string;
  youtube?: string;
  embedYoutube?: string;
  soundcloud?: string;
  embedSoundcloud?: string;
  first?: SanityImage;
  second?: SanityImage;
  third?: SanityImage;
  fourth?: SanityImage;
  categories?: PodcastCategory[];
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
  categories?: PostCategory[];
  content?: PostContentBlock[];
  body?: PortableTextBlock[];
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
  | "soundcloud"
  | "embedSoundcloud"
  | "categories"
>;

export type PostPreview = Pick<
  Post,
  | "_id"
  | "title"
  | "slug"
  | "excerpt"
  | "coverImage"
  | "author"
  | "publishedAt"
  | "categories"
>;

export type Page = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    coverImage?: SanityImage;
    body: PortableTextBlock[];
    _updatedAt: string;
};

export type SocialLink = {
  name: string;
  icon: SanityImage;
  url: string;
};

export type SiteSettings = {
  socialLinks?: SocialLink[];
};
