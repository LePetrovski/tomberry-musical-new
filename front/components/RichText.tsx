import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import type { PortableTextBlock } from "@portabletext/types";
import { urlFor } from "@/lib/sanity/image";

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt ?? ""}
            width={1200}
            height={675}
            className="w-full rounded-xl"
          />
        </figure>
      );
    },
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mt-10 mb-4 text-2xl font-semibold tracking-tight">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-4 border-zinc-300 pl-4 text-secondary-600 italic">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => <p className="mb-4 leading-7 text-secondary-700">{children}</p>,
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-disc space-y-2 pl-6 text-secondary-700">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-2 pl-6 text-secondary-700">{children}</ol>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="font-medium text-secondary-900 underline underline-offset-4 hover:text-secondary-600"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
};

type Props = {
  value: PortableTextBlock[];
};

export function RichText({ value }: Props) {
  return <PortableText value={value} components={components} />;
}
