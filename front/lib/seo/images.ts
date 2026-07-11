import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";

export function getOgImageUrl(image?: SanityImage): string | undefined {
  if (!image) {
    return undefined;
  }

  return urlFor(image).width(1200).height(630).fit("crop").url();
}
