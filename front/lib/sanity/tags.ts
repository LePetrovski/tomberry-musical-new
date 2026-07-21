/** Tags Next.js pour invalider le Data Cache / ISR après un publish Sanity. */
export const SANITY_TAG = "sanity" as const;

export const sanityTags = {
  all: SANITY_TAG,
  podcasts: "sanity:podcasts",
  posts: "sanity:posts",
  pages: "sanity:pages",
  guestAppearances: "sanity:guest-appearances",
  siteSettings: "sanity:site-settings",
} as const;

export type SanityTag = (typeof sanityTags)[keyof typeof sanityTags];
