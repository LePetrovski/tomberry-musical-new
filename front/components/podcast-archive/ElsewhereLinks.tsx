import type { FeaturedLink, FeaturedLinkGroup } from "@/lib/sanity/types";

const GROUP_LABELS: Record<FeaturedLinkGroup, string> = {
    writing: "Écriture",
    social: "Réseaux",
    projects: "Projets",
};

type Props = {
    links?: FeaturedLink[];
};

export function ElsewhereLinks({ links = [] }: Props) {
    if (!links) return null;
    if (!links.length) return null;

    const grouped = links.reduce<Record<FeaturedLinkGroup, FeaturedLink[]>>(
        (acc, link) => {
        acc[link.group] = acc[link.group] ?? [];
        acc[link.group].push(link);
        return acc;
        },
        { writing: [], social: [], projects: [] },
    );

    return (
        <section className="mt-16 rounded-2xl border border-zinc-200 bg-primary-500 p-6">
        <h2 className="text-2xl font-semibold tracking-tight text-secondary-900">Ailleurs</h2>
        <p className="mt-2 text-secondary-600">
            Articles, réseaux et projets autour du Tomberry Musical.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
            {(Object.keys(grouped) as FeaturedLinkGroup[]).map((group) => {
            const groupLinks = grouped[group];
            if (!groupLinks.length) return null;

            return (
                <div key={group}>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
                    {GROUP_LABELS[group]}
                </h3>
                <ul className="mt-3 space-y-3">
                    {groupLinks.map((link) => (
                    <li key={`${link.label}-${link.url}`}>
                        <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-secondary-900 transition-colors hover:text-secondary-700"
                        >
                        {link.label}
                        </a>
                        {link.description && (
                        <p className="mt-1 text-sm text-secondary-600">{link.description}</p>
                        )}
                    </li>
                    ))}
                </ul>
                </div>
            );
            })}
        </div>
        </section>
    );
}
