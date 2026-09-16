import Image from "next/image";
import { RichText } from "@/components/RichText";
import type { PostContentBlock, SanityImage } from "@/lib/sanity/types";
import { urlFor } from "@/lib/sanity/image";
import styles from "./blog-post/BlogPost.module.css";
import type { HeadingIds } from "@/lib/blog/reading";

type Props = {
  blocks: PostContentBlock[];
  headingIds?: HeadingIds[];
};

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
    <figure className={`${styles.figure} ${fullWidth ? styles.fullWidth : ""}`}>
      <div className={`ff-media-well ${styles.imageFrame}`}>
        <Image
          src={urlFor(image).width(1600).url()}
          alt={alt}
          width={1600}
          height={900}
          className="h-auto w-full object-cover"
          sizes={
            fullWidth
              ? "(max-width: 639px) calc(100vw - 104px), (max-width: 1023px) calc(100vw - 136px), (max-width: 1179px) calc(100vw - 184px), 996px"
              : "(max-width: 639px) calc(100vw - 100px), (max-width: 899px) calc(100vw - 132px), 768px"
          }
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function PostContent({ blocks, headingIds }: Props) {
  return (
    <div className={styles.blocks}>
      {blocks.map((block, index) => {
        switch (block._type) {
          case "postTextBlock":
            return (
              <div key={block._key} className={styles.richText}>
                <RichText value={block.content} headingIds={headingIds?.[index]} />
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
                className={`${styles.textImage} ${imageFirst ? "" : styles.imageRight}`}
              >
                <div className={`ff-media-well ${styles.imageFrame} ${styles.textImageMedia}`}>
                  <Image
                    src={urlFor(block.image).width(900).height(675).url()}
                    alt={block.image.alt ?? ""}
                    fill
                    className="object-cover"
                    sizes="(max-width: 639px) calc(100vw - 104px), (max-width: 899px) calc(100vw - 136px), (max-width: 1023px) 768px, 430px"
                  />
                </div>
                <div className={styles.richText}>
                  <RichText value={block.content} headingIds={headingIds?.[index]} />
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
