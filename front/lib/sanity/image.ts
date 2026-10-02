import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "./client";
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

const SANITY_CDN_PREFIX = "https://cdn.sanity.io/";

/** Passe par le proxy Next.js pour éviter les soucis CORS avec Three.js. */
export function textureProxyUrlFor(source: SanityImageSource) {
  const sanityUrl = textureUrlFor(source);
  return `/api/texture?url=${encodeURIComponent(sanityUrl)}`;
}

export function isSanityCdnUrl(url: string) {
  return url.startsWith(SANITY_CDN_PREFIX);
}
