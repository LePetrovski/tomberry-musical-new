import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client, dataset, projectId } from "./client";
import { HOME_TILE_TEXTURE_HEIGHT, HOME_TILE_TEXTURE_WIDTH } from "../home-scene";

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/** URL adaptée au chargement WebGL (crop centré, sans hotspot). */
export function textureUrlFor(source: SanityImageSource) {
  return builder
    .image(source)
    .width(HOME_TILE_TEXTURE_WIDTH)
    .height(HOME_TILE_TEXTURE_HEIGHT)
    .fit("crop")
    .crop("center")
    .format("webp")
    .quality(85)
    .url();
}

/** Passe par le proxy Next.js pour éviter les soucis CORS avec Three.js. */
export function textureProxyUrlFor(source: SanityImageSource) {
  const sanityUrl = textureUrlFor(source);
  return `/api/texture?url=${encodeURIComponent(sanityUrl)}`;
}

export function isSanityImageUrl(value: string) {
  if (!projectId || !dataset) return false;

  try {
    const url = new URL(value);
    const [, type, assetProject, assetDataset, filename, ...rest] = url.pathname.split("/");

    return (
      url.origin === "https://cdn.sanity.io" &&
      !url.username &&
      !url.password &&
      !url.hash &&
      type === "images" &&
      assetProject === projectId &&
      assetDataset === dataset &&
      Boolean(filename) &&
      rest.length === 0
    );
  } catch {
    return false;
  }
}
