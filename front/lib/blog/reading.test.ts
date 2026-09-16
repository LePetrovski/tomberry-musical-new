import assert from "node:assert/strict";
import test from "node:test";
import type { PortableTextBlock } from "@portabletext/types";
import type { PostContentBlock } from "../sanity/types";
import { analyzeArticle, readingProgress } from "./reading";

function text(key: string, value: string, style = "normal"): PortableTextBlock {
  return {
    _type: "block", _key: key, style, markDefs: [],
    children: [{ _type: "span", _key: `${key}-span`, text: value, marks: [] }],
  };
}

const image = { asset: { _ref: "image-example-1600x900-jpg" } };

test("reading time includes excerpt and rendered text, rounding up at 300 words", () => {
  const post = { excerpt: "Introduction", body: [text("p", Array(299).fill("musique").join(" "))] };
  assert.equal(analyzeArticle(post).readingMinutes, 1);
  assert.equal(analyzeArticle({ ...post, excerpt: "Une introduction" }).readingMinutes, 2);
});

test("modern content wins over legacy body and includes captions and mixed blocks", () => {
  const content: PostContentBlock[] = [
    { _type: "postTextBlock", _key: "a", content: [text("p", "Premier texte")] },
    { _type: "postImageBlock", _key: "b", image, caption: "Une légende" },
    { _type: "postTextImageBlock", _key: "c", image, content: [text("p", "Autre texte")] },
  ];
  const result = analyzeArticle({ excerpt: "Introduction", content, body: [text("old", "Ignorer ce texte", "h2")] });
  assert.equal(result.wordCount, 7);
  assert.deepEqual(result.headings, []);
  assert.deepEqual(result.bodyHeadingIds, {});
});

test("empty modern content uses body; absent or blank content hides reading time", () => {
  assert.equal(analyzeArticle({ excerpt: "Introduction", content: [], body: [text("a", "Texte")] }).readingMinutes, 1);
  assert.equal(analyzeArticle({ excerpt: "Introduction" }).readingMinutes, null);
  assert.equal(analyzeArticle({ excerpt: "Introduction", body: [text("a", "   ")] }).hasContent, false);
  assert.equal(analyzeArticle({ excerpt: "", content: [{ _type: "postImageBlock", _key: "a", image }] }).readingMinutes, 1);
});

test("French punctuation, accented words and inline marks do not inflate the word count", () => {
  const block = text("p", "L’univers d’un jeu-vidéo : été ! 🎵");
  block.children.push({ _type: "span", _key: "bold", text: " Compositeur", marks: ["strong"] });
  assert.equal(analyzeArticle({ excerpt: "", body: [block] }).wordCount, 5);
});

test("heading anchors are unique across parent blocks and stable when reordered", () => {
  const first: PostContentBlock = { _type: "postTextBlock", _key: "a", content: [text("same", "Même titre", "h2")] };
  const second: PostContentBlock = { _type: "postTextImageBlock", _key: "b", image, content: [text("same", "Même titre", "h3")] };
  const result = analyzeArticle({ excerpt: "", content: [first, second] });
  assert.equal(new Set(result.headings.map((h) => h.id)).size, 2);
  assert.deepEqual(result.headings.map((h) => h.level), [2, 3]);
  assert.equal(result.contentHeadingIds[0].same, result.headings[0].id);
  assert.equal(result.contentHeadingIds[1].same, result.headings[1].id);
  const reordered = analyzeArticle({ excerpt: "", content: [second, first] });
  assert.equal(reordered.headings[1].id, result.headings[0].id);
});

test("body headings ignore empty titles and match their renderer mapping", () => {
  const result = analyzeArticle({ excerpt: "", body: [text("empty", " ", "h2"), text("é:titre", "Section", "h2")] });
  assert.equal(result.headings.length, 1);
  assert.equal(result.bodyHeadingIds["é:titre"], result.headings[0].id);
  assert.equal(decodeURIComponent(encodeURIComponent(result.headings[0].id)), result.headings[0].id);
});

test("keyless headings use their original array index, including after lists", () => {
  const heading = text("temporary", "Sans clé", "h2");
  delete heading._key;
  const bullet = { ...text("list", "Élément"), listItem: "bullet", level: 1 };
  const result = analyzeArticle({ excerpt: "", body: [bullet, { ...bullet, _key: "list2" }, heading] });
  assert.equal(result.headings[0].id, result.bodyHeadingIds["index:2"]);
});

test("progress is clamped and finishes when the article bottom is visible", () => {
  assert.equal(readingProgress(500, 2000, 800), 0);
  assert.equal(readingProgress(112, 2000, 800), 0);
  assert.equal(readingProgress(-544, 2000, 800), 50);
  assert.equal(readingProgress(-1200, 2000, 800), 100);
  assert.equal(readingProgress(-3000, 2000, 800), 100);
});

test("short articles and viewport changes avoid division by zero", () => {
  assert.equal(readingProgress(200, 300, 800), 0);
  assert.equal(readingProgress(112, 300, 800), 100);
  assert.equal(readingProgress(112, 688, 800), 100);
  assert.equal(readingProgress(-544, 2000, 1000), 59);
  assert.equal(readingProgress(500, 2000, 0), 0);
});
