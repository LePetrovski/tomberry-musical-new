import { blockContent } from "./blockContent";
import { page } from "./page";
import { podcast } from "./podcast";
import { podcastCategory } from "./podcastCategory";
import { post } from "./post";
import {
  postContent,
  postImageBlock,
  postTextBlock,
  postTextImageBlock,
} from "./postContent";
import { postCategory } from "./postCategory";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [
  blockContent,
  page,
  podcast,
  podcastCategory,
  post,
  postCategory,
  postContent,
  postTextBlock,
  postImageBlock,
  postTextImageBlock,
  siteSettings,
];
