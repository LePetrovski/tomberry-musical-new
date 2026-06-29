import { createHash } from "node:crypto";
import slugify from "slugify";
import {
  defaultMapping,
  pickColumn,
  type MysqlPodcastRow,
  type PodcastMappingConfig,
} from "./mapping";

type PortableTextBlock = {
  _type: "block";
  style: "normal" | "h2";
  markDefs: [];
  children: Array<{ _type: "span"; text: string; marks: [] }>;
};

export type SanityPodcastDraft = {
  _id: string;
  _type: "podcast";
  title: string;
  slug: { _type: "slug"; current: string };
  description: string;
  publishedAt: string;
  episodeNumber?: number;
  duration?: string;
  audioUrl?: string;
  body?: PortableTextBlock[];
  coverImageUrl?: string;
  coverImageAlt?: string;
};

function toStringValue(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  if (text.length === 0 || text.toUpperCase() === "NULL") return undefined;
  return text;
}

function extractUrl(value: unknown): string | undefined {
  const text = toStringValue(value);
  if (!text) return undefined;

  const urlMatch = text.match(/https?:\/\/[^\s"'<>]+/i);
  return urlMatch?.[0];
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&agrave;/g, "à")
    .replace(/&ccedil;/g, "ç")
    .replace(/&ocirc;/g, "ô")
    .replace(/&ucirc;/g, "û")
    .replace(/&iuml;/g, "ï")
    .replace(/&rsquo;/g, "'")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

function toNumberValue(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function toIsoDate(value: unknown): string | undefined {
  const text = toStringValue(value);
  if (!text) return undefined;

  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function htmlToPlainText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

function buildBodyBlocks(row: MysqlPodcastRow): PortableTextBlock[] {
  const sections = [
    { label: "Playlist", value: toStringValue(row.playlist) },
    { label: "Discographie", value: toStringValue(row.discographie) },
    { label: "Bibliographie", value: toStringValue(row.bibliographie) },
  ].filter((section) => section.value);

  if (sections.length === 0) {
    const fallback = toStringValue(pickColumn(row, defaultMapping.columns.body));
    return fallback ? textToPortableText(htmlToPlainText(fallback)) : [];
  }

  const blocks: PortableTextBlock[] = [];

  for (const section of sections) {
    blocks.push({
      _type: "block",
      style: "h2",
      markDefs: [],
      children: [{ _type: "span", text: section.label, marks: [] }],
    });
    blocks.push(...textToPortableText(htmlToPlainText(section.value!)));
  }

  return blocks;
}

function pickAudioUrl(row: MysqlPodcastRow, config: PodcastMappingConfig): string | undefined {
  for (const alias of config.columns.audioUrl) {
    const url = extractUrl(row[alias]);
    if (url) return url;
  }
  return undefined;
}

function pickCoverImage(row: MysqlPodcastRow, config: PodcastMappingConfig): string | undefined {
  for (const alias of config.columns.coverImage) {
    const value = toStringValue(row[alias]);
    if (value) return value;
  }
  return undefined;
}

function textToPortableText(text: string): PortableTextBlock[] {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [];

  return paragraphs.map((paragraph) => ({
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _type: "span",
        text: paragraph.replace(/\n/g, " "),
        marks: [],
      },
    ],
  }));
}

function buildSlug(title: string, explicitSlug?: string): string {
  const base = explicitSlug || title;
  return slugify(base, { lower: true, strict: true, locale: "fr" }).slice(0, 96);
}

function buildDocumentId(row: MysqlPodcastRow): string {
  const rawId =
    pickColumn(row, ["id", "ID", "podcast_id", "episode_id"]) ??
    pickColumn(row, defaultMapping.columns.title);

  const seed = String(rawId ?? JSON.stringify(row));
  const hash = createHash("sha1").update(seed).digest("hex").slice(0, 12);
  return `podcast-mysql-${hash}`;
}

export function isPublishedRow(row: MysqlPodcastRow): boolean {
  const value = row.is_published;
  if (value === undefined || value === null) return true;
  return Number(value) === 1;
}

export function mysqlRowToSanityPodcast(
  row: MysqlPodcastRow,
  config: PodcastMappingConfig = defaultMapping,
): SanityPodcastDraft | null {
  const title = toStringValue(
    pickColumn(row, config.columns.title),
  );
  const publishedAt = toIsoDate(
    pickColumn(row, config.columns.publishedAt),
  );

  if (!title || !publishedAt) {
    return null;
  }

  const descriptionRaw =
    toStringValue(pickColumn(row, config.columns.description)) ?? title;
  const description = htmlToPlainText(descriptionRaw).slice(0, 300);

  const slugValue = buildSlug(
    title,
    toStringValue(pickColumn(row, config.columns.slug)),
  );

  const bodyBlocks = buildBodyBlocks(row);
  const body = bodyBlocks.length > 0 ? bodyBlocks : undefined;

  const episodeNumber = toNumberValue(
    pickColumn(row, config.columns.episodeNumber),
  );

  const durationRaw = pickColumn(row, config.columns.duration);
  const durationNumber = toNumberValue(durationRaw);
  const duration =
    toStringValue(durationRaw) ??
    (durationNumber !== undefined ? `${durationNumber} min` : undefined);

  const audioUrl = pickAudioUrl(row, config);
  const coverImageUrl = pickCoverImage(row, config);

  return {
    _id: buildDocumentId(row),
    _type: "podcast",
    title,
    slug: { _type: "slug", current: slugValue },
    description,
    publishedAt,
    episodeNumber,
    duration,
    audioUrl,
    body,
    coverImageUrl,
    coverImageAlt: title,
  };
}
