import Image from "next/image";
import type { ReactNode } from "react";
import type { SanityImage } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  title: string;
  description?: string;
  image?: SanityImage;
  imageAlt?: string;
  /** Métadonnées au-dessus du titre (auteur, date, catégories…). */
  children?: ReactNode;
  className?: string;
};

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function PageHero({
  title,
  description,
  image,
  imageAlt,
  children,
  className,
}: Props) {
  return (
    <header className={joinClasses("mb-8", className)}>
      <div className="crt-card rounded-2xl p-5 sm:p-6">
        {children}
        <h1 className="text-4xl font-semibold tracking-tight text-secondary-900">{title}</h1>
        {description ? (
          <p className="mt-3 text-base! leading-7 text-secondary-600 sm:text-lg!">{description}</p>
        ) : null}
      </div>

      {image ? (
        <div className="relative mt-8 aspect-16/10 overflow-hidden rounded-2xl bg-zinc-100">
          <Image
            src={urlFor(image).width(1200).height(750).url()}
            alt={imageAlt ?? image.alt ?? title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      ) : null}
    </header>
  );
}
