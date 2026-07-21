export const siteConfig = {
  name: "Le Tomberry Musical",
  description: "Vitrine, podcasts et blog propulsés par Next.js et Sanity.",
  locale: "fr_FR",
  language: "fr",
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
