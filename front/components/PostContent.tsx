import Image from "next/image";
import { RichText } from "@/components/RichText";
import type { PostContentBlock, SanityImage } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";

type Props = {
  blocks: PostContentBlock[];
};

function fullBleedClass(fullWidth?: boolean) {
  return fullWidth
    ? "relative left-1/2 w-screen max-w-[1500px] -translate-x-1/2 px-6 lg:px-10"
    : undefined;
}

function PostImage({
  image,
  alt,
  fullWidth,
  caption,
}: {
  image: SanityImage;
  alt: string;
  fullWidth?: boolean;
  caption?: string;
}) {
  return (
    <figure className={fullBleedClass(fullWidth)}>
      <div className={`overflow-hidden bg-zinc-100 ${fullWidth ? "rounded-none lg:rounded-2xl" : "rounded-2xl"}`}>
        <Image
          src={urlFor(image).width(1600).url()}
          alt={alt}
          width={1600}
          height={900}
          className="h-auto w-full object-cover"
          sizes={fullWidth ? "100vw" : "(max-width: 768px) 100vw, 768px"}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-secondary-500">{caption}</figcaption>
      )}
    </figure>
  );
}

export function PostContent({ blocks }: Props) {
  return (
    <div className="space-y-10">
      {blocks.map((block) => {
        switch (block._type) {
          case "postTextBlock":
            return (
              <div key={block._key} className="prose prose-zinc max-w-none">
                <RichText value={block.content} />
              </div>
            );

          case "postImageBlock":
            return (
              <PostImage
                key={block._key}
                image={block.image}
                alt={block.image.alt ?? block.caption ?? ""}
                fullWidth={block.fullWidth}
                caption={block.caption}
              />
            );

          case "postTextImageBlock": {
            const imageFirst = block.imagePosition === "left";

            return (
              <div
                key={block._key}
                className={`grid items-center gap-8 ${imageFirst ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" : "md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"}`}
              >
                <div className={imageFirst ? "md:order-1" : "md:order-2"}>
                  <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-zinc-100">
                    <Image
                      src={urlFor(block.image).width(900).height(675).url()}
                      alt={block.image.alt ?? ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 45vw"
                    />
                  </div>
                </div>
                <div className={`prose prose-zinc max-w-none ${imageFirst ? "md:order-2" : "md:order-1"}`}>
                  <RichText value={block.content} />
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
