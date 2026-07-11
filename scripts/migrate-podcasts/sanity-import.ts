import { createClient, type SanityClient } from "@sanity/client";
import type { SanityPodcastDraft } from "./transform";

type UploadContext = {
  client: SanityClient;
  assetsBaseUrl?: string;
};

type SanityImageField = {
  _type: "image";
  asset: { _type: "reference"; _ref: string };
  alt?: string;
};

type ExistingPodcast = Record<string, unknown>;

export type ImportResult = {
  status: "created" | "updated" | "skipped";
  fields?: string[];
};

const EXTRA_IMAGE_FIELDS = [
  { draftKey: "firstImageUrl", sanityKey: "first" },
  { draftKey: "secondImageUrl", sanityKey: "second" },
  { draftKey: "thirdImageUrl", sanityKey: "third" },
  { draftKey: "fourthImageUrl", sanityKey: "fourth" },
] as const;

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

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;

  if (typeof value === "object") {
    if ("asset" in value) {
      const asset = (value as { asset?: { _ref?: string } }).asset;
      return !asset?._ref;
    }
    if ("current" in value) {
      const current = (value as { current?: string }).current;
      return !current || current.trim() === "";
    }
  }

  return false;
}

function pickMissingFields(
  existing: ExistingPodcast | null,
  candidate: Record<string, unknown>,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(candidate)) {
    if (value === undefined) continue;
    if (isEmpty(existing?.[key])) {
      patch[key] = value;
    }
  }

  return patch;
}

async function resolveImageUrl(
  imagePath: string,
  assetsBaseUrl?: string,
): Promise<string> {
  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (!assetsBaseUrl) {
    throw new Error(
      `Image relative "${imagePath}" : définis MYSQL_ASSETS_BASE_URL dans .env.migration`,
    );
  }

  const coverPath = process.env.MYSQL_COVER_PATH ?? "/img/";
  const normalizedBase = assetsBaseUrl.endsWith("/")
    ? assetsBaseUrl
    : `${assetsBaseUrl}/`;
  const normalizedPath = coverPath.startsWith("/") ? coverPath.slice(1) : coverPath;

  return new URL(
    `${normalizedPath}${imagePath}`.replace(/\/{2,}/g, "/"),
    normalizedBase,
  ).toString();
}

async function uploadImage(
  { client, assetsBaseUrl }: UploadContext,
  imagePath: string,
  filename: string,
  alt?: string,
): Promise<SanityImageField | undefined> {
  const imageUrl = await resolveImageUrl(imagePath, assetsBaseUrl);
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
    filename: `${filename}.${extension}`,
    contentType,
  });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt,
  };
}

async function uploadDraftImages(
  context: UploadContext,
  draft: SanityPodcastDraft,
  existing: ExistingPodcast | null,
): Promise<Partial<Record<"coverImage" | "first" | "second" | "third" | "fourth", SanityImageField>>> {
  const images: Partial<Record<"coverImage" | "first" | "second" | "third" | "fourth", SanityImageField>> = {};

  if (draft.coverImageUrl && isEmpty(existing?.coverImage)) {
    images.coverImage = await uploadImage(
      context,
      draft.coverImageUrl,
      `${draft.slug.current}-cover`,
      draft.coverImageAlt ?? draft.title,
    ).catch((error) => {
      console.warn(`⚠ coverImage ignorée pour "${draft.title}" : ${(error as Error).message}`);
      return undefined;
    });
  }

  for (const { draftKey, sanityKey } of EXTRA_IMAGE_FIELDS) {
    const imagePath = draft[draftKey];
    if (!imagePath || !isEmpty(existing?.[sanityKey])) continue;

    images[sanityKey] = await uploadImage(
      context,
      imagePath,
      `${draft.slug.current}-${sanityKey}`,
      draft.title,
    ).catch((error) => {
      console.warn(`⚠ ${sanityKey} ignorée pour "${draft.title}" : ${(error as Error).message}`);
      return undefined;
    });
  }

  return images;
}

function buildCandidateDocument(
  draft: SanityPodcastDraft,
  images: Partial<Record<"coverImage" | "first" | "second" | "third" | "fourth", SanityImageField>>,
): Record<string, unknown> {
  return {
    title: draft.title,
    slug: draft.slug,
    description: draft.description,
    publishedAt: draft.publishedAt,
    episodeNumber: draft.episodeNumber,
    duration: draft.duration,
    audioUrl: draft.audioUrl,
    youtube: draft.youtube,
    embedYoutube: draft.embedYoutube,
    soundcloud: draft.soundcloud,
    embedSoundcloud: draft.embedSoundcloud,
    body: draft.body,
    ...(images.coverImage ? { coverImage: images.coverImage } : {}),
    ...(images.first ? { first: images.first } : {}),
    ...(images.second ? { second: images.second } : {}),
    ...(images.third ? { third: images.third } : {}),
    ...(images.fourth ? { fourth: images.fourth } : {}),
  };
}

export async function importPodcastDraft(
  context: UploadContext,
  draft: SanityPodcastDraft,
): Promise<ImportResult> {
  const existing = await context.client
    .getDocument(draft._id)
    .catch(() => null) as ExistingPodcast | null;

  const images = await uploadDraftImages(context, draft, existing);
  const candidate = buildCandidateDocument(draft, images);

  if (!existing) {
    await context.client.create({
      _id: draft._id,
      _type: draft._type,
      ...candidate,
    });
    return { status: "created", fields: Object.keys(candidate) };
  }

  const patch = pickMissingFields(existing, candidate);
  if (Object.keys(patch).length === 0) {
    return { status: "skipped" };
  }

  await context.client.patch(draft._id).set(patch).commit();
  return { status: "updated", fields: Object.keys(patch) };
}
