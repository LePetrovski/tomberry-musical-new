import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import type { SocialLink } from "@/lib/sanity/types";

type SocialLinksProps = {
    links: SocialLink[];
    className?: string;
    variant?: "default" | "menu";
};

export function SocialLinks({ links, className, variant = "default" }: SocialLinksProps) {
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
                className={
                    variant === "menu"
                        ? "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-secondary-200/45 bg-secondary-0/16 transition-colors hover:border-primary-200 hover:bg-secondary-100/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-200"
                        : "inline-flex h-9 w-9 items-center justify-center rounded-full border border-secondary-500/25 transition-colors hover:border-secondary-500 hover:bg-secondary-200"
                }
            >
                <Image
                src={urlFor(link.icon).width(32).height(32).url()}
                alt={link.icon.alt ?? link.name}
                width={20}
                height={20}
                className={`h-5 w-5 object-contain ${variant === "menu" ? "ff-menu-social-icon" : ""}`}
                />
            </a>
            </li>
        ))}
        </ul>
    );
}
