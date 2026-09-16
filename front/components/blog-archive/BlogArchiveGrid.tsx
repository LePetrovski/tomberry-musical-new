"use client";

import { BlogCard } from "@/components/BlogCard";
import type { PostPreview } from "@/lib/sanity/types";
import { motion, useReducedMotion } from "motion/react";

type Props = {
  posts: PostPreview[];
  hasActiveFilters: boolean;
};

export function BlogArchiveGrid({ posts, hasActiveFilters }: Props) {
  const shouldReduceMotion = useReducedMotion();

  if (posts.length === 0) {
    return (
      <p className="ff-menu-window ff-archive-window ff-empty-state p-8 text-[16px]! leading-7 sm:p-10">
        {hasActiveFilters
          ? "Aucun article ne correspond à votre recherche."
          : "Aucun article publié pour le moment."}
      </p>
    );
  }

  return (
    <ul aria-label="Articles du blog" className="m-0 grid list-none gap-6 p-0 lg:gap-8">
      {posts.map((post, index) => (
        <motion.li
          key={post._id}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.2,
            delay: shouldReduceMotion ? 0 : Math.min(index, 5) * 0.025,
          }}
          className="min-w-0"
        >
          <BlogCard post={post} />
        </motion.li>
      ))}
    </ul>
  );
}
