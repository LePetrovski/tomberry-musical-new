import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SocialLink } from "@/lib/sanity/types";

type SocialLinksProps = {
    links: SocialLink[];
    className?: string;
};

export function SocialLinks({ links, className }: SocialLinksProps) {
  if (!links.length) {
        return null;
  }

  return (
        <ul className={className ?? "flex items-center gap-3"}>
        {links.map((link) => (
            <li key={`${link.name}-${link.url}`}>
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-secondary-500/25 transition-colors hover:border-secondary-500 hover:bg-secondary-200"
            >
                <Image
                src={urlFor(link.icon).width(32).height(32).url()}
                alt={link.icon.alt ?? link.name}
                width={20}
                height={20}
                className="h-5 w-5 object-contain"
                />
            </a>
            </li>
        ))}
        </ul>
    );
}
