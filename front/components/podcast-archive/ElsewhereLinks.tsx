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
        <section className="ff-menu-window ff-archive-window mt-12 rounded-2xl p-5 sm:p-6">
        <h2 className="ff-archive-title text-2xl font-semibold tracking-tight">Ailleurs</h2>
        <p className="ff-archive-copy mt-2">
            Articles, réseaux et projets autour du Tomberry Musical.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
            {(Object.keys(grouped) as FeaturedLinkGroup[]).map((group) => {
            const groupLinks = grouped[group];
            if (!groupLinks.length) return null;

            return (
                <div key={group}>
                <h3 className="ff-archive-kicker text-sm font-semibold uppercase tracking-wide">
                    {GROUP_LABELS[group]}
                </h3>
                <ul className="mt-3 space-y-3">
                    {groupLinks.map((link) => (
                    <li key={`${link.label}-${link.url}`}>
                        <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ff-menu-list-link font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
                        >
                        {link.label}
                        </a>
                        {link.description && (
                        <p className="ff-archive-copy mt-1 pl-4 text-sm">{link.description}</p>
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
