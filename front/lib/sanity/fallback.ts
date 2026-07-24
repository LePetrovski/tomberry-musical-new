import "server-only";

/**
 * Conserve un fallback pour ne pas casser le rendu, mais journalise l’erreur
 * (au lieu d’un `.catch(() => …)` silencieux).
 */
export function withSanityFallback<T>(
  promise: Promise<T>,
  fallback: T,
  context: string,
): Promise<T> {
  return promise.catch((error: unknown) => {
    console.error(`[sanity] ${context}`, error);
    return fallback;
  });
}
