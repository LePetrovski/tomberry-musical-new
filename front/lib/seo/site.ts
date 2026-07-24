export const siteConfig = {
  name: "Le Tomberry Musical",
  tagline: "Le podcast sur la musique de jeux vidéo",
  description:
    "Le Tomberry Musical est un podcast francophone dédié à la musique de jeux vidéo : bandes originales, compositeurs, coulisses et culture VGM.",
  locale: "fr_FR",
  language: "fr",
  host: {
    name: "Tomberry",
    description:
      "Animateur de Le Tomberry Musical, podcast francophone sur la musique de jeux vidéo.",
  },
} as const;

/** URL canonique du site (définir NEXT_PUBLIC_SITE_URL en production). */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

/** URLs uniques pour schema.org `sameAs` (réseaux, plateformes d’écoute, etc.). */
export function uniqueSameAs(urls: Array<string | undefined | null>): string[] {
  return Array.from(
    new Set(urls.map((url) => url?.trim()).filter((url): url is string => Boolean(url))),
  );
}
