"use client";

import { AnimateNumber } from "motion-plus/react";

type Props = {
  count: number;
  noun: "épisode" | "apparition" | "compilation";
};

export function PodcastResultsCount({ count, noun }: Props) {
  const plural = count !== 1;

  return (
    <p className="text-sm font-medium text-secondary-600" aria-live="polite" aria-atomic="true">
      <AnimateNumber transition={{ duration: 0.2 }}>{count}</AnimateNumber> {noun}
      {plural ? "s" : ""} trouvé{plural ? "s" : ""}
    </p>
  );
}
