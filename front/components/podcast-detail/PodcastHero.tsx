"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

type Props = {
  imageUrl?: string;
  imageAlt: string;
  imagePosition?: string;
  children: ReactNode;
};

export function PodcastHero({ imageUrl, imageAlt, imagePosition = "50% 50%", children }: Props) {
  const heroRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const coverY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const coverScale = useTransform(scrollYProgress, [0, 1], [1, 1.035]);
  const coverOpacity = useTransform(scrollYProgress, [0, 0.82, 1], [1, 0.5, 0.35]);

  return (
    <section ref={heroRef} className="ff-podcast-hero relative isolate">
      <div className="ff-podcast-hero-media relative h-[clamp(360px,58vw,720px)] overflow-hidden rounded-2xl">
        {imageUrl ? (
          <motion.div
            className="absolute -inset-x-2 -inset-y-3 will-change-transform"
            style={
              prefersReducedMotion
                ? undefined
                : { y: coverY, scale: coverScale, opacity: coverOpacity }
            }
          >
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              priority
              quality={90}
              className="object-cover"
              style={{ objectPosition: imagePosition }}
              sizes="(max-width: 1536px) 100vw, 1440px"
            />
          </motion.div>
        ) : (
          <div className="ff-podcast-hero-empty absolute inset-0 flex items-center justify-center text-sm font-semibold">
            Sans visuel
          </div>
        )}
        <div className="ff-podcast-hero-shade pointer-events-none absolute inset-0" aria-hidden="true" />
      </div>

      <div className="ff-menu-window ff-archive-window ff-podcast-hero-panel relative z-10 mx-3 -mt-12 rounded-2xl p-5 sm:mx-8 sm:-mt-24 sm:p-7 lg:mx-auto lg:max-w-[1120px] lg:p-9">
        {children}
      </div>
    </section>
  );
}
