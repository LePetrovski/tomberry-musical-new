"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { PodcastCard } from "@/components/PodcastCard";
import type { PodcastPreview } from "@/lib/sanity/types";

type Props = {
  podcasts: PodcastPreview[];
  hasActiveFilters: boolean;
  displayMode: "grid" | "list";
};

export function PodcastArchiveGrid({ podcasts, hasActiveFilters, displayMode }: Props) {
  const shouldReduceMotion = useReducedMotion();

  if (podcasts.length === 0) {
    return (
      <p className="rounded-[1.5rem] border border-dashed border-secondary-500/30 bg-primary-500 p-8 text-secondary-600">
        {hasActiveFilters
          ? "Aucun épisode ne correspond à votre recherche."
          : "Aucun podcast publié pour le moment."}
      </p>
    );
  }

  return (
    <LayoutGroup id="podcast-archive">
      <motion.div
        layout
        className={
          displayMode === "grid"
            ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3"
            : "grid gap-5"
        }
      >
        <AnimatePresence initial={false} mode="popLayout">
          {podcasts.map((podcast, index) => (
            <motion.div
              layout
              key={podcast._id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2, delay: shouldReduceMotion ? 0 : Math.min(index, 8) * 0.025 }}
            >
              <PodcastCard podcast={podcast} variant={displayMode} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
