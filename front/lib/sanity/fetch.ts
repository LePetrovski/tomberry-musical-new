import { client } from "./client";
import { SANITY_TAG, type SanityTag } from "./tags";

type SanityFetchOptions = {
  tags?: SanityTag[];
  /** Filet de sécurité ISR si le webhook échoue (secondes). */
  revalidate?: number | false;
};

/**
 * Fetch Sanity branché sur le Data Cache Next.js (`tags` + `revalidate`).
 * Les tags permettent l’invalidation on-demand via `/api/revalidate`.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
  options: SanityFetchOptions = {},
): Promise<T> {
  const tags = Array.from(new Set([SANITY_TAG, ...(options.tags ?? [])]));

  return client.fetch<T>(query, params, {
    next: {
      tags,
      revalidate: options.revalidate ?? 3600,
    },
  });
}
