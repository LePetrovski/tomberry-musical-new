"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { CompilationCard } from "@/components/compilation/CompilationCard";
import type { CompilationPreview } from "@/lib/sanity/types";

type Props = {
  compilations: CompilationPreview[];
  hasActiveFilters: boolean;
  displayMode: "grid" | "list";
};

export function CompilationArchiveGrid({ compilations, hasActiveFilters, displayMode }: Props) {
  const shouldReduceMotion = useReducedMotion();

  if (compilations.length === 0) {
    return (
      <p className="crt-card rounded-2xl border-dashed p-6 text-secondary-600">
        {hasActiveFilters
          ? "Aucune compilation ne correspond à votre recherche."
          : "Aucune compilation publiée pour le moment."}
      </p>
    );
  }

  return (
    <LayoutGroup id="compilation-archive">
      <motion.div
        layout
        className={displayMode === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "grid gap-4"}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {compilations.map((compilation, index) => (
            <motion.div
              layout
              key={compilation._id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.2,
                delay: shouldReduceMotion ? 0 : Math.min(index, 8) * 0.025,
              }}
            >
              <CompilationCard compilation={compilation} variant={displayMode} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
