import type { PortableTextBlock } from "@portabletext/types";
import type { Post } from "../sanity/types";

export type ArticleHeading = { id: string; text: string; level: 2 | 3 };
export type HeadingIds = Record<string, string>;

/** Keys are scoped to their Portable Text array, including mixed text/image blocks. */
function headingId(scope: string, key: string) {
  return `section-${encodeURIComponent(scope)}:${encodeURIComponent(key)}`;
}

export function analyzeArticle(post: Pick<Post, "excerpt" | "content" | "body">) {
  const headings: ArticleHeading[] = [];
  const texts: string[] = [post.excerpt];
  const contentHeadingIds: HeadingIds[] = [];
  let hasContent = false;

  function readText(blocks: PortableTextBlock[], scope: string): HeadingIds {
    const ids: HeadingIds = {};
    for (const [index, block] of blocks.entries()) {
      if (block._type === "image") {
        hasContent = true;
        continue;
      }
      if (block._type !== "block") continue;
      const text = block.children
        ?.map((child) => child._type === "span" ? child.text : "")
        .join("").trim() ?? "";
      if (!text) continue;
      hasContent = true;
      texts.push(text);
      if (block.style === "h2" || block.style === "h3") {
        const key = block._key ?? `index:${index}`;
        const id = headingId(scope, key);
        ids[key] = id;
        headings.push({ id, text, level: block.style === "h2" ? 2 : 3 });
      }
    }
    return ids;
  }

  let bodyHeadingIds: HeadingIds = {};
  if (post.content?.length) {
    post.content.forEach((block) => {
      let ids: HeadingIds = {};
      if (block._type === "postTextBlock" || block._type === "postTextImageBlock") {
        ids = readText(block.content, `content:${block._key}`);
      }
      if (block._type === "postImageBlock" || block._type === "postTextImageBlock") {
        hasContent = true;
      }
      if (block._type === "postImageBlock" && block.caption) texts.push(block.caption);
      contentHeadingIds.push(ids);
    });
  } else {
    bodyHeadingIds = readText(post.body ?? [], "body");
  }

  const wordCount = texts.join(" ").match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return {
    hasContent,
    wordCount,
    readingMinutes: hasContent ? Math.max(1, Math.ceil(wordCount / 300)) : null,
    headings,
    contentHeadingIds,
    bodyHeadingIds,
  };
}

/** 0 at the reading line; 100 once the end of the body fits in the viewport. */
export function readingProgress(top: number, height: number, viewportHeight: number, offset = 112) {
  const visibleHeight = Math.max(1, viewportHeight - offset);
  if (height <= visibleHeight) return top <= offset ? 100 : 0;
  return Math.round(Math.max(0, Math.min(1, (offset - top) / (height - visibleHeight))) * 100);
}
