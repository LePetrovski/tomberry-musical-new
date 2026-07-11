import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "./client";

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/** URL adaptée au chargement WebGL (crop centré, sans hotspot). */
export function textureUrlFor(source: SanityImageSource) {
  return builder.image(source).width(800).height(500).fit("crop").crop("center").url();
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
