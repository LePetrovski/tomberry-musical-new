import type { PodcastPurchaseLinks } from "@/lib/sanity/types";

type Props = {
  purchaseLinks?: PodcastPurchaseLinks;
};

export function PurchaseCTA({ purchaseLinks }: Props) {
  const links = [
    { label: "Acheter le jeu", url: purchaseLinks?.gameUrl },
    { label: "Acheter l'OST", url: purchaseLinks?.soundtrackUrl },
  ].filter((link): link is { label: string; url: string } => Boolean(link.url));

  if (links.length === 0) return null;

  return (
    <section className="rounded-2xl border border-secondary-500/20 bg-secondary-500/5 p-5">
      <h2 className="text-sm font-semibold text-secondary-900">Acheter</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} (nouvel onglet)`}
            className="inline-flex items-center justify-center rounded-full border border-secondary-500 bg-secondary-500 px-4 py-2 text-center text-sm font-medium text-primary-500 transition-colors hover:border-secondary-700 hover:bg-secondary-700"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
