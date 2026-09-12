"use client";

import { AnimateNumber } from "motion-plus/react";

type Props = {
  count: number;
  noun: "épisode" | "apparition" | "compilation";
};

export function PodcastResultsCount({ count, noun }: Props) {
  const plural = count !== 1;

  return (
    <p className="whitespace-nowrap text-xs font-medium text-secondary-700" aria-live="polite" aria-atomic="true">
      <AnimateNumber transition={{ duration: 0.2 }}>{count}</AnimateNumber> {noun}
      {plural ? "s" : ""} trouvé{plural ? "s" : ""}
    </p>
  );
}
