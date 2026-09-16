import type { ReviewLink } from "@/lib/sanity/types";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  reviewLinks?: ReviewLink[];
};

export function ReviewCTA({ reviewLinks = [] }: Props) {
  if (!reviewLinks) return null;
  if (!reviewLinks.length) return null;

  return (
    <Card className="ff-menu-window ff-archive-window gap-0 rounded-2xl p-4.5">
      <section>
      <Heart aria-hidden="true" className="size-5 text-tertiary-500" />
      <h2 className="ff-archive-title mt-3 text-xl! font-semibold">Aider le podcast à grandir</h2>
      <p className="ff-archive-copy mt-2 text-sm leading-6">
        Un avis ou un commentaire sur une plateforme d&apos;écoute aide le podcast à être
        découvert. Merci si vous prenez une minute pour le laisser.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {reviewLinks.map((link) => (
          <a
            key={`${link.platform}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ff-command-button inline-flex rounded-md px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
          >
            {link.label}
          </a>
        ))}
      </div>
      </section>
    </Card>
  );
}
