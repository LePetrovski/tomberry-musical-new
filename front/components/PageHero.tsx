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
    <header className={joinClasses("mb-10", className)}>
      <div className="rounded-2xl bg-primary-500 p-6 sm:p-8">
        {children}
        <h1 className="text-4xl font-semibold tracking-tight text-secondary-900">{title}</h1>
        {description ? (
          <p className="mt-4 text-lg leading-8 text-secondary-600">{description}</p>
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
