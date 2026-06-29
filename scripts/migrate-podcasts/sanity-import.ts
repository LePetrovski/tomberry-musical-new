import { createClient, type SanityClient } from "@sanity/client";
import type { SanityPodcastDraft } from "./transform";

type UploadContext = {
  client: SanityClient;
  assetsBaseUrl?: string;
};

export function createMigrationClient() {
  const projectId =
    process.env.SANITY_PROJECT_ID ??
    process.env.SANITY_STUDIO_PROJECT_ID ??
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset =
    process.env.SANITY_DATASET ??
    process.env.SANITY_STUDIO_DATASET ??
    process.env.NEXT_PUBLIC_SANITY_DATASET ??
    "production";
  const token = process.env.SANITY_API_TOKEN;

  if (!projectId) {
    throw new Error(
      "SANITY_PROJECT_ID manquant (ou SANITY_STUDIO_PROJECT_ID / NEXT_PUBLIC_SANITY_PROJECT_ID).",
    );
  }

  if (!token) {
    throw new Error(
      "SANITY_API_TOKEN manquant. Crée un token Editor sur https://www.sanity.io/manage",
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: process.env.SANITY_API_VERSION ?? "2025-01-01",
    token,
    useCdn: false,
  });
}

async function resolveImageUrl(
  coverImageUrl: string,
  assetsBaseUrl?: string,
): Promise<string> {
  if (/^https?:\/\//i.test(coverImageUrl)) {
    return coverImageUrl;
  }

  if (!assetsBaseUrl) {
    throw new Error(
      `Image relative "${coverImageUrl}" : définis MYSQL_ASSETS_BASE_URL dans .env.migration`,
    );
  }

  const coverPath = process.env.MYSQL_COVER_PATH ?? "/img/";
  const normalizedBase = assetsBaseUrl.endsWith("/")
    ? assetsBaseUrl
    : `${assetsBaseUrl}/`;
  const normalizedPath = coverPath.startsWith("/") ? coverPath.slice(1) : coverPath;

  return new URL(
    `${normalizedPath}${coverImageUrl}`.replace(/\/{2,}/g, "/"),
    normalizedBase,
  ).toString();
}

async function uploadCoverImage(
  { client, assetsBaseUrl }: UploadContext,
  draft: SanityPodcastDraft,
) {
  if (!draft.coverImageUrl) return undefined;

  const imageUrl = await resolveImageUrl(draft.coverImageUrl, assetsBaseUrl);
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Téléchargement image échoué (${response.status}) : ${imageUrl}`);
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";

  const asset = await client.assets.upload("image", buffer, {
    filename: `${draft.slug.current}.${extension}`,
    contentType,
  });

  return {
    _type: "image" as const,
    asset: { _type: "reference" as const, _ref: asset._id },
    alt: draft.coverImageAlt ?? draft.title,
  };
}

export async function importPodcastDraft(
  context: UploadContext,
  draft: SanityPodcastDraft,
) {
  const coverImage = await uploadCoverImage(context, draft).catch((error) => {
    console.warn(`⚠ Image ignorée pour "${draft.title}" : ${(error as Error).message}`);
    return undefined;
  });

  const document = {
    _id: draft._id,
    _type: draft._type,
    title: draft.title,
    slug: draft.slug,
    description: draft.description,
    publishedAt: draft.publishedAt,
    episodeNumber: draft.episodeNumber,
    duration: draft.duration,
    audioUrl: draft.audioUrl,
    body: draft.body,
    ...(coverImage ? { coverImage } : {}),
  };

  await context.client.createOrReplace(document);
  return document;
}
