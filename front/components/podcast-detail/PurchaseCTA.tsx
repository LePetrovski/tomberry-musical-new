import type { PodcastPurchaseLinks } from "@/lib/sanity/types";
import { ExternalLink, Gamepad2, Music2 } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  purchaseLinks?: PodcastPurchaseLinks;
};

export function PurchaseCTA({ purchaseLinks }: Props) {
  const links = [
    { label: "Acheter le jeu", url: purchaseLinks?.gameUrl, icon: Gamepad2 },
    { label: "Acheter l'OST", url: purchaseLinks?.soundtrackUrl, icon: Music2 },
  ].filter((link): link is { label: string; url: string; icon: typeof Gamepad2 } => Boolean(link.url));

  if (links.length === 0) return null;

  return (
    <Card className="gap-0 rounded-[1.5rem] border-0 bg-secondary-900 p-5 text-primary-500 ring-0">
      <section>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-tertiary-500">Autour de l&apos;épisode</p>
      <h2 className="mt-1 text-xl! font-semibold text-primary-500">Acheter</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${link.label} (nouvel onglet)`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-4 py-2 text-center text-sm font-semibold text-primary-500 transition-colors hover:border-tertiary-500 hover:bg-tertiary-500 hover:text-secondary-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tertiary-500"
          >
            <link.icon aria-hidden="true" className="size-4" />
            {link.label}
            <ExternalLink aria-hidden="true" className="size-3.5 opacity-70" />
          </a>
        ))}
      </div>
      </section>
    </Card>
  );
}
