import type { ReviewLink } from "@/lib/sanity/types";

type Props = {
  reviewLinks?: ReviewLink[];
};

export function ReviewCTA({ reviewLinks = [] }: Props) {
  if (!reviewLinks) return null;
  if (!reviewLinks.length) return null;

  return (
    <section className="rounded-2xl border border-secondary-500/20 bg-secondary-500/5 p-5">
      <h2 className="text-sm font-semibold text-secondary-900">Aider le podcast à grandir</h2>
      <p className="mt-2 text-sm leading-6 text-secondary-600">
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
            className="rounded-full border border-secondary-500/25 bg-primary-500 px-4 py-2 text-sm font-medium text-secondary-700 transition-colors hover:border-secondary-500 hover:bg-secondary-500 hover:text-primary-500"
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
